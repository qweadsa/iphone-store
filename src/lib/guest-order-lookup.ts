import { prisma } from "@/lib/prisma";
import { getPaymentTransferRef } from "@/lib/payment-ref";

export type GuestBlindboxLookup = {
  kind: "blindbox";
  paymentId: string;
  transferRef: string;
  email: string;
  amount: number;
  paymentStatus: string;
  purpose: string;
  createdAt: string;
  drawn: boolean;
  prizeName: string | null;
  prizeType: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function paymentEmailWhere(email: string) {
  const normalized = normalizeEmail(email);
  return {
    OR: [{ email: normalized }, { user: { email: normalized } }],
  };
}

async function findPaymentByTransferRef(
  transferRef: string,
  email: string,
) {
  const recent = await prisma.payment.findMany({
    where: paymentEmailWhere(email),
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    recent.find(
      (p) => getPaymentTransferRef(p.paymentId, p.metadata) === transferRef,
    ) ?? null
  );
}

export async function findGuestBlindboxPayment(
  orderNumber: string,
  email: string,
): Promise<GuestBlindboxLookup | null> {
  const ref = orderNumber.trim();
  const normalizedEmail = normalizeEmail(email);
  if (!ref || !normalizedEmail) return null;

  let payment = null;

  if (/^PAY-/i.test(ref)) {
    payment = await prisma.payment.findFirst({
      where: {
        paymentId: ref.toUpperCase(),
        ...paymentEmailWhere(normalizedEmail),
      },
    });
  } else if (/^\d{5}$/.test(ref)) {
    payment = await findPaymentByTransferRef(ref, normalizedEmail);
  } else {
    payment = await prisma.payment.findFirst({
      where: {
        paymentId: { contains: ref.toUpperCase() },
        ...paymentEmailWhere(normalizedEmail),
      },
    });
  }

  if (!payment || payment.purpose !== "blindbox") return null;

  const draw = await prisma.blindBoxDraw.findFirst({
    where: { paymentId: payment.paymentId },
    select: { prizeName: true, prizeType: true },
  });

  return {
    kind: "blindbox",
    paymentId: payment.paymentId,
    transferRef: getPaymentTransferRef(payment.paymentId, payment.metadata),
    email: payment.email ?? normalizedEmail,
    amount: payment.amount,
    paymentStatus: payment.status,
    purpose: payment.purpose,
    createdAt: payment.createdAt.toISOString(),
    drawn: !!draw,
    prizeName: draw?.prizeName ?? null,
    prizeType: draw?.prizeType ?? null,
  };
}
