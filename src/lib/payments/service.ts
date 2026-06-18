import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
import {
  createPayPalOrder,
  isPayPalConfigured,
  getPayPalClientId,
} from "./paypal";
import { generateMethodQr, getReceiveSettings } from "./receive-qr";
import { getPaymentRequireAdminConfirm } from "./settings";
import type { CreatePaymentInput, PaymentResult } from "./types";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function generatePaymentId(): string {
  return `PAY-${generateOrderNumber().replace("ORD-", "")}`;
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<PaymentResult> {
  const paymentId = generatePaymentId();
  const demoMode = !isPayPalConfigured();
  const payPageUrl = `${siteUrl()}/pay/${paymentId}`;

  let payerEmail = input.email?.trim().toLowerCase() || null;
  if (!payerEmail && input.userId) {
    const account = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    });
    payerEmail = account?.email ?? null;
  }

  let payUrl = payPageUrl;
  let externalId: string | null = null;
  let provider = demoMode ? "demo" : "paypal";

  if (!demoMode) {
    try {
      const pp = await createPayPalOrder(
        input.amount,
        input.purpose,
        `${siteUrl()}/api/payments/paypal/return?paymentId=${paymentId}`,
        `${siteUrl()}/pay/${paymentId}?cancelled=1`,
      );
      payUrl = pp.approveUrl;
      externalId = pp.orderId;
    } catch {
      provider = "demo";
    }
  }

  await prisma.payment.create({
    data: {
      paymentId,
      userId: input.userId ?? null,
      email: payerEmail,
      amount: input.amount,
      purpose: input.purpose,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      provider,
      externalId,
      payUrl,
      status: "pending",
    },
  });

  const receiveSettings = await getReceiveSettings();
  const requireAdminConfirm = await getPaymentRequireAdminConfirm();

  // 只预生成默认 PayPal 二维码，其余方式按需加载，避免卡顿
  const defaultMethodQr = await generateMethodQr(
    "paypal",
    input.amount,
    paymentId,
    receiveSettings,
  );

  return {
    paymentId,
    amount: input.amount,
    status: "pending",
    payUrl,
    qrDataUrl: defaultMethodQr.qrDataUrl,
    paypalClientId: getPayPalClientId(),
    demoMode: provider === "demo",
    methodQrs: { paypal: defaultMethodQr },
    receiveNote: receiveSettings.receiveNote,
    requireAdminConfirm,
  };
}

export async function completePayment(
  paymentId: string,
  method: string,
): Promise<{ ok: boolean; purpose?: string; metadata?: unknown }> {
  const payment = await prisma.payment.findUnique({ where: { paymentId } });
  if (!payment || payment.status === "completed") {
    return { ok: payment?.status === "completed" };
  }

  await prisma.payment.update({
    where: { paymentId },
    data: { status: "completed", method },
  });

  if (payment.purpose === "recharge" && payment.userId) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: payment.userId },
        data: { balance: { increment: payment.amount } },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: payment.userId,
          amount: payment.amount,
          type: "deposit",
          paymentId,
          description: `Recharge $${payment.amount.toFixed(2)}`,
        },
      }),
    ]);
  }

  return {
    ok: true,
    purpose: payment.purpose,
    metadata: payment.metadata,
  };
}

export async function payWithBalance(
  paymentId: string,
  userId: number,
): Promise<{ ok: boolean; error?: string }> {
  const payment = await prisma.payment.findUnique({ where: { paymentId } });
  if (!payment) return { ok: false, error: "Payment not found" };
  if (payment.status === "completed") return { ok: true };
  if (payment.purpose === "blindbox") {
    return { ok: false, error: "Blind box must be paid by QR scan" };
  }
  if (payment.userId && payment.userId !== userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "User not found" };
  if (user.balance < payment.amount) {
    return { ok: false, error: "Insufficient balance" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: payment.amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        userId,
        amount: -payment.amount,
        type: "spend",
        paymentId,
        description: `Payment ${payment.purpose} $${payment.amount.toFixed(2)}`,
      },
    }),
    prisma.payment.update({
      where: { paymentId },
      data: { status: "completed", method: "balance", userId },
    }),
  ]);

  return { ok: true };
}

export async function cancelPayment(
  paymentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const payment = await prisma.payment.findUnique({ where: { paymentId } });
  if (!payment) return { ok: false, error: "Payment not found" };
  if (payment.status === "cancelled") return { ok: true };
  if (payment.status !== "pending") {
    return { ok: false, error: "Payment already processed" };
  }

  await prisma.payment.update({
    where: { paymentId },
    data: { status: "cancelled" },
  });

  return { ok: true };
}
