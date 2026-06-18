import { prisma } from "@/lib/prisma";
import { getPaymentTransferRef } from "@/lib/payment-ref";
import {
  drawNeedsShippingAddress,
  getPrizeFulfillment,
  needsShippingClaim,
  prizeFromDraw,
} from "@/lib/blindbox-fulfillment";
import type { BlindBoxPrize } from "@/types/blindbox";

export type GuestShopOrderRecord = {
  kind: "order";
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  paymentId: string | null;
  prizeName: string | null;
  needsShippingAddress: boolean;
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

export type PendingAddressClaim = {
  paymentId: string;
  prizeName: string;
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

function isPlaceholderAddress(address: string | null | undefined): boolean {
  const value = address?.trim() ?? "";
  return !value || value === "—" || value === "-";
}

function parseBlindboxPrizeName(itemName: string): string | null {
  const match = itemName.match(/Won:\s*(.+)$/i);
  return match?.[1]?.trim() ?? null;
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

  const fulfillment = getPrizeFulfillment(prizeFromDraw(draw));

  if (fulfillment?.type === "retry") return "retry";
  if (needsShippingClaim(fulfillment)) {
    if (draw.claimedAt) return "address_submitted";
    return "awaiting_address";
  }
  return "digital_sent";
}

function orderNeedsShippingAddress(
  order: {
    address: string;
    paymentId: string | null;
    items: { productId: string; name: string; color: string }[];
  },
  drawByPayment: Map<
    string,
    {
      prizeType: string;
      prizeName: string;
      fulfillmentType: string | null;
      claimedAt: Date | null;
    }
  >,
): { needsShippingAddress: boolean; prizeName: string | null } {
  const blindboxItem = order.items.find((item) => item.productId === "blindbox-draw");
  if (!blindboxItem || !order.paymentId || !isPlaceholderAddress(order.address)) {
    return { needsShippingAddress: false, prizeName: null };
  }

  const draw = drawByPayment.get(order.paymentId);
  if (draw) {
    return {
      needsShippingAddress: drawNeedsShippingAddress(draw),
      prizeName: draw.prizeName,
    };
  }

  const prizeName = parseBlindboxPrizeName(blindboxItem.name) ?? blindboxItem.name;
  const prize: BlindBoxPrize = {
    key: blindboxItem.color,
    name: prizeName,
    weight: 0,
    emoji: "🎁",
    fulfillmentType:
      blindboxItem.color === "grand" || blindboxItem.color === "case"
        ? blindboxItem.color
        : undefined,
  };
  const needsShippingAddress = needsShippingClaim(getPrizeFulfillment(prize));

  return {
    needsShippingAddress,
    prizeName: needsShippingAddress ? prizeName : null,
  };
}

export function getPendingAddressClaims(records: GuestLookupRecord[]): PendingAddressClaim[] {
  const claims: PendingAddressClaim[] = [];

  for (const record of records) {
    if (record.kind === "blindbox" && record.shippingStatus === "awaiting_address") {
      claims.push({
        paymentId: record.paymentId,
        prizeName: record.prizeName ?? "Prize",
      });
      continue;
    }

    if (
      record.kind === "order" &&
      record.needsShippingAddress &&
      record.paymentId &&
      record.prizeName
    ) {
      claims.push({
        paymentId: record.paymentId,
        prizeName: record.prizeName,
      });
    }
  }

  const seen = new Set<string>();
  return claims.filter((claim) => {
    if (seen.has(claim.paymentId)) return false;
    seen.add(claim.paymentId);
    return true;
  });
}

export async function findGuestRecordsByEmail(
  email: string,
): Promise<GuestLookupRecord[]> {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  const orders = await prisma.order.findMany({
    where: { email: normalized },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const orderPaymentIds = orders
    .map((order) => order.paymentId)
    .filter((id): id is string => !!id);

  const drawsByEmail = await prisma.blindBoxDraw.findMany({
    where: { email: normalized },
    select: { paymentId: true },
  });
  const drawPaymentIds = drawsByEmail.map((draw) => draw.paymentId);

  const linkedPaymentIds = [...new Set([...orderPaymentIds, ...drawPaymentIds])];

  const payments = await prisma.payment.findMany({
    where: {
      purpose: "blindbox",
      OR: [
        ...paymentEmailWhere(normalized).OR,
        ...(linkedPaymentIds.length
          ? [{ paymentId: { in: linkedPaymentIds } }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
    const shipping = orderNeedsShippingAddress(order, drawByPayment);
    records.push({
      kind: "order",
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      paymentId: order.paymentId,
      prizeName: shipping.prizeName,
      needsShippingAddress: shipping.needsShippingAddress,
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
      email: draw?.email ?? payment.email ?? normalized,
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
