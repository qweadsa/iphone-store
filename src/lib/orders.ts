export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUSES: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "待处理" },
  { key: "paid", label: "已付款" },
  { key: "shipped", label: "已发货" },
  { key: "delivered", label: "已送达" },
  { key: "cancelled", label: "已取消" },
];

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${ts}-${rand}`;
}

export function getStatusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.key === status)?.label ?? status;
}
