import type { Prisma } from "@prisma/client";
import { generateOrderNumber } from "@/lib/orders";

type Tx = Prisma.TransactionClient;

type EnsureBlindBoxOrderInput = {
  paymentId: string;
  paymentAmount: number;
  prizeName: string;
  prizeKey: string;
  fulfillmentType: string | null;
  email: string | null;
  customerName: string | null;
};

export async function findBlindBoxOrder(paymentId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.order.findFirst({
    where: { paymentId },
    select: { orderNumber: true, email: true },
  });
}

export async function ensureBlindBoxOrder(
  tx: Tx,
  input: EnsureBlindBoxOrderInput,
): Promise<{ orderNumber: string; email: string } | null> {
  const existing = await tx.order.findFirst({
    where: { paymentId: input.paymentId },
    select: { orderNumber: true, email: true },
  });
  if (existing) {
    return { orderNumber: existing.orderNumber, email: existing.email };
  }

  const email = input.email?.trim().toLowerCase();
  if (!email) return null;

  const customerName = input.customerName?.trim() || email.split("@")[0] || "Customer";
  const orderNumber = generateOrderNumber();
  const prizeLabel =
    input.fulfillmentType === "retry" ? input.prizeName : `Won: ${input.prizeName}`;

  await tx.order.create({
    data: {
      orderNumber,
      customerName,
      email,
      phone: null,
      address: "—",
      city: "",
      state: "",
      zip: "",
      total: input.paymentAmount,
      status: "paid",
      paymentId: input.paymentId,
      items: {
        create: {
          productId: "blindbox-draw",
          name: `Mystery Box — ${prizeLabel}`,
          color: input.fulfillmentType ?? input.prizeKey,
          storage: "—",
          price: input.paymentAmount,
          quantity: 1,
        },
      },
    },
  });

  return { orderNumber, email };
}
