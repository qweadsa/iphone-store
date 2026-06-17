"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";

type OrderItem = {
  name: string;
  color: string;
  storage: string;
  price: number;
  quantity: number;
};

type Order = {
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const { messages: m } = useI18n();
  const o = m.orders;

  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") ?? "",
  );
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const num = searchParams.get("orderNumber");
    const em = searchParams.get("email");
    if (!num || !em) return;
    setOrderNumber(num);
    setEmail(em);
    (async () => {
      setLoading(true);
      setError("");
      setOrder(null);
      const params = new URLSearchParams({ orderNumber: num, email: em });
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? o.notFound);
        return;
      }
      setOrder(data);
    })();
  }, [searchParams, o.notFound]);

  async function lookup(num?: string, em?: string) {
    const on = num ?? orderNumber;
    const mail = em ?? email;
    if (!on.trim() || !mail.trim()) {
      setError(o.fillBoth);
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    const params = new URLSearchParams({ orderNumber: on.trim(), email: mail.trim() });
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? o.notFound);
      return;
    }
    setOrder(data);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{o.title}</h1>
      <p className="mt-2 text-[var(--color-muted)]">{o.subtitle}</p>

      <div className="mt-8 space-y-3">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder={o.orderNumber}
          className="site-input"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={o.email}
          className="site-input"
        />
        <button onClick={() => lookup()} disabled={loading} className="site-btn w-full">
          {loading ? o.searching : o.search}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {order && (
        <div className="site-card mt-8 p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono font-bold">{order.orderNumber}</p>
            <span className="rounded-full bg-[#FFB800]/15 px-3 py-1 text-xs font-medium text-[#FFB800]">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {order.customerName} · {new Date(order.createdAt).toLocaleString()}
          </p>
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name} · {item.storage} · {item.color} ×{item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-semibold">
            <span>{o.total}</span>
            <span className="text-[#FFB800]">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white/50">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
