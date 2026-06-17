import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/user-auth";
import {
  getPrizeFulfillment,
  needsShippingClaim,
  isWalletCreditPrize,
} from "@/lib/blindbox-fulfillment";
import { applyDrawCredit } from "@/lib/blindbox-credit";
import { ensureBlindBoxOrder, findBlindBoxOrder } from "@/lib/blindbox-order";
import { isDrawablePrize, mapDbPrize } from "@/lib/blindbox-prize-utils";
import type { BlindBoxPrize } from "@/types/blindbox";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function rollPrize(prizes: BlindBoxPrize[]): BlindBoxPrize {
  const total = prizes.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1];
}

type PaymentRow = {
  paymentId: string;
  amount: number;
  email: string | null;
  userId: number | null;
};

async function resolveOrderReceipt(
  payment: PaymentRow,
  draw: {
    prizeType: string;
    prizeName: string;
    fulfillmentType: string | null;
    email: string | null;
  },
  customerName: string | null,
) {
  const existing = await findBlindBoxOrder(payment.paymentId);
  if (existing) {
    return { orderNumber: existing.orderNumber, orderEmail: existing.email };
  }

  const email = draw.email ?? payment.email;
  if (!email) return { orderNumber: null, orderEmail: null };

  const created = await prisma.$transaction((tx) =>
    ensureBlindBoxOrder(tx, {
      paymentId: payment.paymentId,
      paymentAmount: payment.amount,
      prizeName: draw.prizeName,
      prizeKey: draw.prizeType,
      fulfillmentType: draw.fulfillmentType,
      email,
      customerName,
    }),
  );
  if (!created) return { orderNumber: null, orderEmail: null };
  return { orderNumber: created.orderNumber, orderEmail: created.email };
}

function drawPayload(
  draw: {
    id: number;
    prizeType: string;
    prizeName: string;
    paymentId: string;
    fulfillmentType: string | null;
    creditApplied: boolean;
    claimedAt: Date | null;
  },
  prize: BlindBoxPrize,
  fulfillment: ReturnType<typeof getPrizeFulfillment>,
  credited: boolean,
  order?: { orderNumber: string | null; orderEmail: string | null },
) {
  return {
    drawId: draw.id,
    paymentId: draw.paymentId,
    prize,
    fulfillment,
    credited,
    needsLogin: isWalletCreditPrize(fulfillment) && !credited,
    needsShipping: needsShippingClaim(fulfillment) && !draw.claimedAt,
    alreadyDrawn: true,
    orderNumber: order?.orderNumber ?? null,
    orderEmail: order?.orderEmail ?? null,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.paymentId?.trim();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { paymentId } });
    if (!payment || payment.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }
    if (payment.purpose !== "blindbox") {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    const user = await getSessionUser();
    const customerName = user?.name ?? null;

    const existing = await prisma.blindBoxDraw.findFirst({
      where: { paymentId },
    });
    if (existing) {
      const prize = {
        key: existing.prizeType,
        name: existing.prizeName,
        weight: 0,
        emoji: "🎁",
        fulfillmentType: (existing.fulfillmentType ?? existing.prizeType) as BlindBoxPrize["fulfillmentType"],
      } as BlindBoxPrize;
      const fulfillment = getPrizeFulfillment(prize);
      const order = await resolveOrderReceipt(payment, existing, customerName);
      return NextResponse.json(
        drawPayload(existing, prize, fulfillment, existing.creditApplied, order),
      );
    }

    const config = await prisma.blindBoxConfig.findFirst({ where: { id: 1 } });
    if (config?.dailyLimit && config.dailyLimit > 0) {
      const todayCount = await prisma.blindBoxDraw.count({
        where: { createdAt: { gte: startOfToday() } },
      });
      if (todayCount >= config.dailyLimit) {
        return NextResponse.json(
          { error: "今日抽奖次数已达上限，请明天再来" },
          { status: 429 },
        );
      }
    }

    const rows = await prisma.blindBoxPrize.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    const prizes: BlindBoxPrize[] = rows.map(mapDbPrize).filter(isDrawablePrize);
    if (prizes.length === 0) {
      return NextResponse.json({ error: "No drawable prizes configured" }, { status: 503 });
    }

    const prize = rollPrize(prizes);
    const userId = user?.id ?? payment.userId ?? null;
    const email = user?.email ?? payment.email ?? null;
    const fulfillment = getPrizeFulfillment(prize);
    const fulfillmentType = fulfillment?.type ?? prize.fulfillmentType ?? prize.key;
    const creditAmount = fulfillment?.type === "credit" ? fulfillment.amount : null;

    let credited = false;
    let orderNumber: string | null = null;
    let orderEmail: string | null = null;

    const draw = await prisma.$transaction(async (tx) => {
      const created = await tx.blindBoxDraw.create({
        data: {
          paymentId,
          email,
          prizeType: prize.key,
          prizeName: prize.name,
          fulfillmentType,
          isVerified: true,
          allowPublicDisplay: fulfillmentType !== "retry",
          creditAmount,
          creditApplied: false,
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      });

      if (fulfillment?.type === "credit" && userId) {
        credited = await applyDrawCredit(tx, created, userId);
      }

      const order = await ensureBlindBoxOrder(tx, {
        paymentId,
        paymentAmount: payment.amount,
        prizeName: prize.name,
        prizeKey: prize.key,
        fulfillmentType,
        email,
        customerName,
      });
      orderNumber = order?.orderNumber ?? null;
      orderEmail = order?.email ?? null;

      return created;
    });

    return NextResponse.json({
      drawId: draw.id,
      paymentId,
      prize,
      fulfillment,
      credited,
      needsLogin: isWalletCreditPrize(fulfillment) && !credited,
      needsShipping: needsShippingClaim(fulfillment),
      orderNumber,
      orderEmail,
    });
  } catch (error) {
    console.error("[blindbox/draw]", error);
    return NextResponse.json({ error: "抽奖失败，请稍后重试" }, { status: 500 });
  }
}
