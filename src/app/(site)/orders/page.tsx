"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";
import PrizeAddressForm from "@/components/PrizeAddressForm";
import type {
  BlindboxShippingStatus,
  GuestLookupRecord,
} from "@/lib/guest-order-lookup";

type LookupResponse = {
  email: string;
  records: GuestLookupRecord[];
};

function isBlindboxRecord(
  record: GuestLookupRecord,
): record is Extract<GuestLookupRecord, { kind: "blindbox" }> {
  return record.kind === "blindbox";
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const { messages: m } = useI18n();
  const o = m.orders;

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [records, setRecords] = useState<GuestLookupRecord[]>([]);
  const [queriedEmail, setQueriedEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runLookup(em: string) {
    const mail = em.trim();
    if (!mail) {
      setError(o.fillEmail);
      return;
    }
    setLoading(true);
    setError("");
    setRecords([]);
    setQueriedEmail("");
    const params = new URLSearchParams({ email: mail });
    const res = await fetch(`/api/orders?${params}`);
    const data = (await res.json()) as LookupResponse & { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? o.notFound);
      return;
    }
    setQueriedEmail(data.email);
    setRecords(data.records ?? []);
  }

  useEffect(() => {
    const em = searchParams.get("email");
    if (!em) return;
    setEmail(em);
    void runLookup(em);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function orderStatusLabel(status: string) {
    if (status === "shipped") return o.statusOrderShipped;
    if (status === "delivered") return o.statusOrderDelivered;
    if (status === "paid") return o.statusOrderPaid;
    if (status === "cancelled") return o.statusOrderCancelled;
    return o.statusOrderPending;
  }

  function blindboxStatusLabel(status: BlindboxShippingStatus) {
    const map: Record<BlindboxShippingStatus, string> = {
      pending_payment: o.statusPendingPayment,
      cancelled: o.statusCancelled,
      awaiting_draw: o.statusAwaitingDraw,
      retry: o.statusRetry,
      digital_sent: o.statusDigitalSent,
      awaiting_address: o.statusAwaitingAddress,
      address_submitted: o.statusAddressSubmitted,
    };
    return map[status];
  }

  const pendingAddressCount = records.filter(
    (r) => isBlindboxRecord(r) && r.shippingStatus === "awaiting_address",
  ).length;

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{o.title}</h1>
      <p className="mt-2 text-[var(--color-muted)]">{o.subtitle}</p>

      <div className="mt-8 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={o.email}
          className="site-input"
        />
        <button
          onClick={() => void runLookup(email)}
          disabled={loading}
          className="site-btn w-full"
        >
          {loading ? o.searching : o.search}
        </button>
      </div>

      {error && (
        <div className="mt-4">
          <p className="text-sm text-red-400">{error}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{o.emptyHint}</p>
        </div>
      )}

      {records.length > 0 && (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            {queriedEmail}
            <span className="mx-2">·</span>
            {records.length} {o.recordCount}
          </p>

          {pendingAddressCount > 0 && (
            <div className="rounded-xl border border-[#FFB800]/40 bg-[#FFB800]/10 p-4">
              <p className="font-semibold text-[#FFB800]">{o.fillAddressBanner}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{o.fillAddressHint}</p>
            </div>
          )}

          {records.map((record) =>
            isBlindboxRecord(record) ? (
              <div key={record.paymentId} className="site-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{o.blindboxTitle}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {new Date(record.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#FFB800]/15 px-3 py-1 text-xs font-medium text-[#FFB800]">
                    {formatPrice(record.amount)}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)]">{o.paymentRef}</span>
                    <span className="font-mono font-bold text-[#FFB800]">
                      {record.transferRef}
                    </span>
                  </div>
                  {record.prizeName && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[var(--color-muted)]">{o.prizeWon}</span>
                      <span className="text-right font-medium text-green-400">
                        {record.prizeName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--color-muted)]">{o.shippingStatus}</span>
                    <span className="text-right font-medium">
                      {blindboxStatusLabel(record.shippingStatus)}
                    </span>
                  </div>
                </div>

                {record.shippingStatus === "awaiting_address" && record.prizeName && (
                  <div className="mt-5 rounded-xl border border-[#FFB800]/25 bg-[#FFB800]/5 p-4">
                    <p className="mb-3 text-sm font-semibold text-white">{o.fillAddressTitle}</p>
                    <PrizeAddressForm
                      paymentId={record.paymentId}
                      prizeName={record.prizeName}
                      defaultEmail={queriedEmail}
                      onSuccess={() => void runLookup(queriedEmail)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div key={record.orderNumber} className="site-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{o.shopOrderTitle}</p>
                    <p className="mt-1 font-mono text-sm">{record.orderNumber}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      record.status === "shipped" || record.status === "delivered"
                        ? "bg-green-500/15 text-green-400"
                        : record.status === "cancelled"
                          ? "bg-white/10 text-white/50"
                          : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {orderStatusLabel(record.status)}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                  {record.items.map((item, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span>
                        {item.name} · {item.storage} · {item.color} ×{item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-semibold">
                  <span>{o.total}</span>
                  <span className="text-[#FFB800]">{formatPrice(record.total)}</span>
                </div>
              </div>
            ),
          )}
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
