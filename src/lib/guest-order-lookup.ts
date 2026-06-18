import { prisma } from "@/lib/prisma";
import { getPaymentTransferRef } from "@/lib/payment-ref";

export type GuestShopOrderRecord = {
  kind: "order";
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    name: string;
    color: string;
    storage: string;
    price: number;
    quantity: number;
  }[];
};

export type BlindboxShippingStatus =
  | "pending_payment"
  | "cancelled"
  | "awaiting_draw"
  | "retry"
  | "digital_sent"
  | "awaiting_address"
  | "address_submitted";

export type GuestBlindboxRecord = {
  kind: "blindbox";
  paymentId: string;
  transferRef: string;
  email: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  drawn: boolean;
  prizeName: string | null;
  prizeType: string | null;
  fulfillmentType: string | null;
  shippingStatus: BlindboxShippingStatus;
};

export type GuestLookupRecord = GuestShopOrderRecord | GuestBlindboxRecord;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function paymentEmailWhere(email: string) {
  const normalized = normalizeEmail(email);
  return {
    OR: [{ email: normalized }, { user: { email: normalized } }],
  };
}

function blindboxShippingStatus(
  payment: { status: string },
  draw: {
    prizeType: string;
    prizeName: string;
    fulfillmentType: string | null;
    claimedAt: Date | null;
  } | null,
): BlindboxShippingStatus {
  if (payment.status === "cancelled") return "cancelled";
  if (payment.status !== "completed") return "pending_payment";
  if (!draw) return "awaiting_draw";

  const fulfillmentType = draw.fulfillmentType ?? draw.prizeType;

  if (fulfillmentType === "retry" || draw.prizeType === "retry") return "retry";
  if (fulfillmentType === "grand" || fulfillmentType === "case") {
    if (draw.claimedAt) return "address_submitted";
    return "awaiting_address";
  }
  return "digital_sent";
}

export async function findGuestRecordsByEmail(
  email: string,
): Promise<GuestLookupRecord[]> {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      where: { email: normalized },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: {
        ...paymentEmailWhere(normalized),
        purpose: "blindbox",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const paymentIds = payments.map((p) => p.paymentId);
  const draws =
    paymentIds.length > 0
      ? await prisma.blindBoxDraw.findMany({
          where: { paymentId: { in: paymentIds } },
        })
      : [];
  const drawByPayment = new Map(draws.map((d) => [d.paymentId, d]));

  const records: GuestLookupRecord[] = [];

  for (const order of orders) {
    records.push({
      kind: "order",
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        name: item.name,
        color: item.color,
        storage: item.storage,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  for (const payment of payments) {
    const draw = drawByPayment.get(payment.paymentId) ?? null;
    records.push({
      kind: "blindbox",
      paymentId: payment.paymentId,
      transferRef: getPaymentTransferRef(payment.paymentId, payment.metadata),
      email: payment.email ?? normalized,
      amount: payment.amount,
      paymentStatus: payment.status,
      createdAt: payment.createdAt.toISOString(),
      drawn: !!draw,
      prizeName: draw?.prizeName ?? null,
      prizeType: draw?.prizeType ?? null,
      fulfillmentType: draw?.fulfillmentType ?? null,
      shippingStatus: blindboxShippingStatus(payment, draw),
    });
  }

  records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return records;
}
