"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/products";
import { useUser } from "@/lib/user-context";
import { useI18n } from "@/lib/i18n-context";
import type { PaymentPurpose } from "@/lib/payments/types";
import type { MethodQr } from "@/lib/payments/types";
import { CHECKOUT_METHODS, DEFAULT_CHECKOUT_METHOD, type PaymentMethodId } from "@/lib/payments/methods";
import DuitNowQrPanel from "@/components/DuitNowQrPanel";
import PaymentMethodIcon from "./PaymentMethodIcon";

type Props = {
  amount: number;
  purpose: PaymentPurpose;
  title: string;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  metadata?: Record<string, unknown>;
};

type PaymentData = {
  paymentId: string;
  methodQrs?: Partial<Record<string, MethodQr>>;
  receiveNote?: string | null;
  requireAdminConfirm?: boolean;
};

type PayPhase = "loading" | "balance_ok" | "balance_low" | "guest_qr";

const DEFAULT_METHOD: PaymentMethodId = DEFAULT_CHECKOUT_METHOD;

export default function PaymentModal({
  amount,
  purpose,
  title,
  onClose,
  onSuccess,
  metadata,
}: Props) {
  const { messages: m } = useI18n();
  const p = m.payment;
  const { user, loading: userLoading, refresh } = useUser();

  const [payLoading, setPayLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [selected, setSelected] = useState<PaymentMethodId>(DEFAULT_METHOD);
  const [activeQr, setActiveQr] = useState<MethodQr | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const createdRef = useRef(false);
  const completedRef = useRef(false);
  const paymentIdRef = useRef<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  async function handleDismiss() {
    if (payment?.paymentId && !completedRef.current) {
      try {
        await fetch(`/api/payments/${payment.paymentId}/cancel`, { method: "POST" });
      } catch {
        /* ignore */
      }
    }
    onClose();
  }

  const phase: PayPhase = useMemo(() => {
    if (payLoading || userLoading) return "loading";
    if (purpose === "blindbox" || purpose === "recharge") {
      return user ? "balance_low" : "guest_qr";
    }
    if (!user) return "guest_qr";
    if (user.balance >= amount) return "balance_ok";
    return "balance_low";
  }, [payLoading, userLoading, user, amount, purpose]);

  const methodLabel = (id: PaymentMethodId) => {
    const labels: Record<string, string> = {
      duitnow: p.methodDuitNow,
      tng: p.methodTng,
      grabpay: p.methodGrabPay,
      shopeepay: p.methodShopeePay,
      visa: p.methodVisa,
      paypal: p.methodPayPal,
      crypto: p.methodCrypto,
      balance: p.balance,
      qr: p.qr,
    };
    return labels[id] ?? CHECKOUT_METHODS.find((m) => m.id === id)?.short ?? id;
  };

  function isValidGuestEmail(value: string) {
    const email = value.trim().toLowerCase();
    return email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  useEffect(() => {
    if (userLoading || createdRef.current) return;
    if (!user && !isValidGuestEmail(guestEmail)) return;

    let cancelled = false;
    const delay = user ? 0 : 450;

    const timer = window.setTimeout(async () => {
      if (cancelled || createdRef.current) return;
      createdRef.current = true;
      setPayLoading(true);
      setError("");
      try {
        const payload: Record<string, unknown> = { amount, purpose, metadata };
        if (!user) payload.email = guestEmail.trim().toLowerCase();

        const res = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          createdRef.current = false;
          setError(data.error ?? p.error);
          return;
        }
        setPayment(data);
        paymentIdRef.current = data.paymentId;
        setActiveQr(data.methodQrs?.[DEFAULT_CHECKOUT_METHOD] ?? null);
        if (!user) setEmailSaved(true);
      } catch {
        createdRef.current = false;
        setError(p.error);
      } finally {
        if (!cancelled) setPayLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [userLoading, user, guestEmail, amount, purpose, metadata, p.error]);

  useEffect(() => {
    return () => {
      const id = paymentIdRef.current;
      if (id && !completedRef.current) {
        fetch(`/api/payments/${id}/cancel`, { method: "POST" }).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!payment?.paymentId) return;

    const cached = payment.methodQrs?.[selected];
    if (cached) {
      setActiveQr(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      setQrLoading(true);
      try {
        const res = await fetch(
          `/api/payments/${payment.paymentId}/qr?method=${selected}`,
        );
        const data = await res.json();
        if (!cancelled && res.ok) {
          setActiveQr(data);
          setPayment((prev) =>
            prev
              ? { ...prev, methodQrs: { ...prev.methodQrs, [selected]: data } }
              : prev,
          );
        }
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [payment?.paymentId, selected, payment?.methodQrs]);

  useEffect(() => {
    if (!payment?.paymentId || !payment.requireAdminConfirm) return;

    let cancelled = false;
    setAwaitingConfirm(true);

    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/${payment.paymentId}`);
        const data = await res.json();
        if (!cancelled && res.ok && data.status === "completed") {
          completedRef.current = true;
          setAwaitingConfirm(false);
          onSuccessRef.current(payment.paymentId);
        }
      } catch {
        /* retry */
      }
    };

    poll();
    const timer = window.setInterval(poll, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [payment?.paymentId, payment?.requireAdminConfirm]);

  async function saveGuestEmail(required = false): Promise<boolean> {
    if (!payment?.paymentId || user) return true;
    const email = guestEmail.trim().toLowerCase();
    if (!email) {
      if (required) setError(p.guestEmailRequired);
      return false;
    }
    if (!isValidGuestEmail(email)) {
      if (required) setError(p.guestEmailInvalid);
      return false;
    }
    const res = await fetch(`/api/payments/${payment.paymentId}/contact`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      if (required) setError(p.guestEmailInvalid);
      return false;
    }
    setEmailSaved(true);
    setError("");
    return true;
  }

  async function payWithBalance() {
    if (!payment || !user) return;
    setPaying(true);
    setError("");
    const res = await fetch(`/api/payments/${payment.paymentId}/balance`, {
      method: "POST",
    });
    const data = await res.json();
    setPaying(false);
    if (!res.ok) {
      setError(data.error ?? p.error);
      return;
    }
    completedRef.current = true;
    await refresh();
    onSuccess(payment.paymentId);
  }

  async function confirmQrPaid(method: PaymentMethodId = selected) {
    if (!payment) return;
    if (!user && !(await saveGuestEmail(true))) return;
    setPaying(true);
    setError("");
    const res = await fetch(
      `/api/payments/${payment.paymentId}/confirm-demo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      },
    );
    setPaying(false);
    if (res.ok) {
      completedRef.current = true;
      onSuccess(payment.paymentId);
    } else setError(p.error);
  }

  const showQrFlow =
    purpose === "blindbox" ||
    purpose === "recharge" ||
    phase === "guest_qr" ||
    phase === "balance_low";
  const showBalancePay =
    purpose !== "recharge" &&
    purpose !== "blindbox" &&
    phase === "balance_ok" &&
    !!user;
  const requireAdminConfirm = !!payment?.requireAdminConfirm;
  const showSelfConfirm = !requireAdminConfirm;
  const guestCanPay = !!user ? !!payment : !!payment && emailSaved;
  const waitingForGuestEmail = !user && !userLoading && !isValidGuestEmail(guestEmail);
  const preparingPayment = userLoading || payLoading || (!user && isValidGuestEmail(guestEmail) && !payment);

  const isDuitNowFlow = showQrFlow && selected === "duitnow";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0a0a12] text-[#F5F5F7] shadow-2xl sm:rounded-2xl">
        <div
          className={`border-b px-5 py-4 ${
            isDuitNowFlow && guestCanPay
              ? "border-[#ED0677]/25 bg-gradient-to-r from-[#ED0677]/20 via-[#d9056f]/10 to-transparent"
              : "border-white/10 bg-gradient-to-r from-[#FFB800]/10 to-transparent"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className={`text-[11px] font-semibold uppercase tracking-widest ${
                  isDuitNowFlow && guestCanPay ? "text-[#ff6eb4]" : "text-[#FFB800]"
                }`}
              >
                {isDuitNowFlow && guestCanPay ? p.duitnowCheckoutBadge : p.secureCheckout}
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">{title}</h2>
              <p className="mt-1 text-3xl font-bold text-[#FFB800]">
                {formatPrice(amount)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full bg-white/10 px-2.5 py-1 text-sm text-white/60 hover:bg-white/15 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          {userLoading && (
            <p className="py-10 text-center text-sm text-white/50">{p.loading}</p>
          )}

          {!userLoading && (
            <>
              {!user && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="block text-xs font-medium text-white/70">
                    {p.guestEmailLabel}
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    readOnly={!!payment && emailSaved}
                    onChange={(e) => {
                      if (payment && emailSaved) return;
                      setGuestEmail(e.target.value);
                      setError("");
                    }}
                    placeholder={p.guestEmailPlaceholder}
                    className="site-input mt-1.5 w-full"
                  />
                  <p className="mt-1 text-[11px] text-white/40">
                    {preparingPayment
                      ? p.loading
                      : emailSaved
                        ? p.guestEmailSaved
                        : p.guestEmailHint}
                  </p>
                </div>
              )}

              {user && (purpose === "blindbox" || purpose === "recharge") && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-medium text-white/70">{p.payerEmailLabel}</p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-[#FFB800]">
                    {user.email}
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">{p.loggedInPayHint}</p>
                </div>
              )}

              {waitingForGuestEmail && (
                <p className="mt-4 text-sm text-white/50">{p.guestEmailFirst}</p>
              )}

              {preparingPayment && !payment && (
                <p className="mt-4 text-center text-sm text-white/50">{p.loading}</p>
              )}

              {payment && (
                <>

              {showBalancePay && user && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <p className="text-xs text-white/50">{p.balanceLabel}</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatPrice(user.balance)}
                  </p>
                  <button
                    type="button"
                    onClick={payWithBalance}
                    disabled={paying}
                    className="site-btn mt-3 w-full py-3 text-sm font-bold disabled:opacity-50"
                  >
                    {paying ? p.processing : p.payWithBalance}
                  </button>
                </div>
              )}

              {showQrFlow && !user && !guestCanPay && !waitingForGuestEmail && payment && (
                <p className="mt-4 text-sm text-white/50">{p.guestEmailFirst}</p>
              )}

              {guestCanPay && showQrFlow && (
                <div className="mt-4">
                  {CHECKOUT_METHODS.length > 1 && (
                    <MethodTabs
                      selected={selected}
                      onSelect={setSelected}
                      label={p.selectMethod}
                      methodLabel={methodLabel}
                    />
                  )}
                  <DuitNowQrPanel
                    loading={qrLoading || payLoading}
                    activeQr={activeQr}
                    amount={amount}
                    paymentId={payment.paymentId}
                    receiveNote={payment.receiveNote}
                    p={p}
                  />
                </div>
              )}

              {!user && (
                <p className="mt-4 text-center text-xs text-white/40">
                  {p.guestLoginOptional}{" "}
                  <Link href="/login" className="text-[#FFB800] hover:underline">
                    {p.login}
                  </Link>
                </p>
              )}

              {requireAdminConfirm && showQrFlow && guestCanPay && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#ED0677]/35 bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3]">
                  <div className="bg-[#ED0677] px-4 py-2">
                    <p className="text-center text-[12px] font-bold text-white">
                      {p.awaitingMerchant}
                    </p>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <p className="text-[12px] font-medium text-[#9d174d]">
                      {awaitingConfirm ? p.awaitingMerchantHint : p.merchantConfirmed}
                    </p>
                    <div className="mt-3 flex justify-center gap-1.5">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#ED0677]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#ED0677] [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#ED0677] [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>

        {!payLoading &&
          !userLoading &&
          payment &&
          showSelfConfirm &&
          guestCanPay &&
          showQrFlow && (
            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => confirmQrPaid(selected)}
                disabled={paying || qrLoading || !activeQr}
                className="w-full rounded-xl bg-gradient-to-r from-[#ED0677] to-[#b8005c] py-3.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {paying ? p.processing : p.confirmPaid}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

function MethodTabs({
  selected,
  onSelect,
  label,
  methodLabel,
}: {
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
  label: string;
  methodLabel: (id: PaymentMethodId) => string;
}) {
  return (
    <div className="mt-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
        {label}
      </p>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {CHECKOUT_METHODS.map((method) => {
          const active = selected === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ${
                active
                  ? "border-[#FFB800] bg-[#FFB800]/10 ring-1 ring-[#FFB800]/40"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
              }`}
            >
              <PaymentMethodIcon method={method.id} large className="w-full" />
              <span
                className={`text-[11px] font-semibold leading-tight ${
                  active ? "text-[#FFB800]" : "text-white/85"
                }`}
              >
                {methodLabel(method.id)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
