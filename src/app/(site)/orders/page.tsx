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

type ShopOrder = {
  kind?: "order";
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type BlindboxOrder = {
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

type LookupResult = ShopOrder | BlindboxOrder;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function isBlindboxResult(data: LookupResult): data is BlindboxOrder {
  return data.kind === "blindbox";
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const { messages: m } = useI18n();
  const o = m.orders;

  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") ?? "",
  );
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runLookup(num: string, em: string) {
    if (!num.trim() || !em.trim()) {
      setError(o.fillBoth);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    const params = new URLSearchParams({ orderNumber: num.trim(), email: em.trim() });
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? o.notFound);
      return;
    }
    setResult(data as LookupResult);
  }

  useEffect(() => {
    const num = searchParams.get("orderNumber");
    const em = searchParams.get("email");
    if (!num || !em) return;
    setOrderNumber(num);
    setEmail(em);
    void runLookup(num, em);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function paymentStatusLabel(status: string) {
    if (status === "completed") return o.paymentCompleted;
    if (status === "cancelled") return o.paymentCancelled;
    return o.paymentPending;
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
        <button
          onClick={() => void runLookup(orderNumber, email)}
          disabled={loading}
          className="site-btn w-full"
        >
          {loading ? o.searching : o.search}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {result && isBlindboxResult(result) && (
        <div className="site-card mt-8 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold">{o.blindboxTitle}</p>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                result.paymentStatus === "completed"
                  ? "bg-green-500/15 text-green-400"
                  : result.paymentStatus === "cancelled"
                    ? "bg-white/10 text-white/50"
                    : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {paymentStatusLabel(result.paymentStatus)}
            </span>
          </div>

          <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--color-muted)]">{o.paymentRef}</span>
              <span className="font-mono text-lg font-bold text-[#FFB800]">
                {result.transferRef}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--color-muted)]">{o.paymentId}</span>
              <span className="break-all font-mono text-right text-xs">{result.paymentId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--color-muted)]">{o.email}</span>
              <span>{result.email}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--color-muted)]">{o.total}</span>
              <span className="font-semibold text-[#FFB800]">{formatPrice(result.amount)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--color-muted)]">{o.drawStatus}</span>
              <span className={result.drawn ? "text-green-400" : "text-amber-300"}>
                {result.drawn ? o.drawDone : o.drawPending}
              </span>
            </div>
            {result.drawn && result.prizeName && (
              <div className="flex justify-between gap-4">
                <span className="text-[var(--color-muted)]">{o.prizeWon}</span>
                <span className="text-right font-medium">{result.prizeName}</span>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-[var(--color-muted)]">
            {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      {result && !isBlindboxResult(result) && (
        <div className="site-card mt-8 p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono font-bold">{result.orderNumber}</p>
            <span className="rounded-full bg-[#FFB800]/15 px-3 py-1 text-xs font-medium text-[#FFB800]">
              {STATUS_LABELS[result.status] ?? result.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {result.customerName} · {new Date(result.createdAt).toLocaleString()}
          </p>
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {result.items.map((item, i) => (
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
            <span className="text-[#FFB800]">{formatPrice(result.total)}</span>
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
