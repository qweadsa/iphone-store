import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function applyDrawCredit(
  tx: Tx,
  draw: {
    id: number;
    prizeName: string;
    paymentId: string;
    creditAmount: number | null;
    creditApplied: boolean;
    fulfillmentType: string | null;
  },
  userId: number,
): Promise<boolean> {
  if (draw.creditApplied || draw.fulfillmentType !== "credit") return false;
  const amount = draw.creditAmount;
  if (amount == null || amount <= 0) return false;

  await tx.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
  });
  await tx.walletTransaction.create({
    data: {
      userId,
      amount,
      type: "prize",
      paymentId: draw.paymentId,
      description: `Blind box prize: ${draw.prizeName}`,
    },
  });
  await tx.blindBoxDraw.update({
    where: { id: draw.id },
    data: {
      creditApplied: true,
      user: { connect: { id: userId } },
    },
  });
  return true;
}
