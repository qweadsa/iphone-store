"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { useUser } from "@/lib/user-context";
import { useI18n } from "@/lib/i18n-context";
import PaymentModal from "@/components/PaymentModal";

const QUICK_AMOUNTS = [20, 50, 100, 200];
const MIN_RECHARGE = 5;
const MAX_RECHARGE = 10000;

type WalletTxn = {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
};

type DrawRecord = {
  id: number;
  prizeName: string;
  prizeType: string;
  createdAt: string;
};

export default function AccountPage() {
  const { user, loading, logout, refresh } = useUser();
  const { messages: m } = useI18n();
  const a = m.auth;
  const p = m.payment;

  const [customAmount, setCustomAmount] = useState("50");
  const [rechargeAmount, setRechargeAmount] = useState<number | null>(null);
  const [rechargeError, setRechargeError] = useState("");
  const [txns, setTxns] = useState<WalletTxn[]>([]);
  const [draws, setDraws] = useState<DrawRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/auth/wallet")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTxns);
    fetch("/api/auth/draws")
      .then((r) => (r.ok ? r.json() : []))
      .then(setDraws);
  }, [user]);

  function parseRechargeAmount(raw?: string): number | null {
    const value = Number((raw ?? customAmount).replace(/,/g, "").trim());
    if (!Number.isFinite(value)) return null;
    const rounded = Math.round(value * 100) / 100;
    if (rounded < MIN_RECHARGE || rounded > MAX_RECHARGE) return null;
    return rounded;
  }

  function startRecharge(amount?: number) {
    const value = amount ?? parseRechargeAmount();
    if (value === null) {
      setRechargeError(a.rechargeInvalid);
      return;
    }
    setRechargeError("");
    setCustomAmount(String(value));
    setRechargeAmount(value);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center text-[var(--color-muted)]">
        {a.loading}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-[var(--color-muted)]">{a.pleaseLogin}</p>
        <Link href="/login" className="site-btn mt-4 inline-block">
          {a.loginBtn}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{a.accountTitle}</h1>
          <p className="mt-1 text-[var(--color-muted)]">{user.name}</p>
          <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-[var(--color-muted)] hover:text-red-500"
        >
          {a.logout}
        </button>
      </div>

      <div className="mt-8 site-card bg-gradient-to-br from-[#FFB800]/15 to-[#FF7A00]/10 p-6">
        <p className="text-sm text-[var(--color-muted)]">{a.balance}</p>
        <p className="mt-1 text-4xl font-bold text-[#FFB800]">{formatPrice(user.balance)}</p>
      </div>

      <h2 className="mt-8 text-lg font-semibold">{a.rechargeTitle}</h2>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{a.rechargeDesc}</p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => {
              setCustomAmount(String(amt));
              setRechargeError("");
            }}
            className={`rounded-xl border py-3 text-sm font-semibold transition ${
              Number(customAmount) === amt
                ? "border-[#FFB800] bg-[#FFB800]/15 text-[#FFB800]"
                : "border-white/10 bg-white/[0.04] hover:border-[#FFB800]/40 hover:bg-[#FFB800]/10"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      <div className="mt-4 site-card p-4">
        <label className="block text-sm font-medium text-white/80">
          {a.rechargeCustomLabel}
        </label>
        <div className="mt-2 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              $
            </span>
            <input
              type="number"
              min={MIN_RECHARGE}
              max={MAX_RECHARGE}
              step="0.01"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setRechargeError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") startRecharge();
              }}
              placeholder="50.00"
              className="site-input w-full pl-7"
            />
          </div>
          <button
            type="button"
            onClick={() => startRecharge()}
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#FFB800] to-[#FF7A00] px-5 py-2.5 text-sm font-bold text-[#03030A]"
          >
            {a.rechargePayBtn}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/40">{a.rechargeRange}</p>
        {rechargeError && (
          <p className="mt-2 text-sm text-red-400">{rechargeError}</p>
        )}
      </div>

      <Link
        href="/orders"
        className="mt-6 block text-center text-sm site-link"
      >
        {a.viewOrders} →
      </Link>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{a.drawHistory}</h2>
        {draws.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">{a.noDraws}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {draws.map((d) => (
              <li
                key={d.id}
                className="site-card flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>
                  {d.prizeType === "retry" ? "🍀" : "🎁"} {d.prizeName}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{a.walletHistory}</h2>
        {txns.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">{a.noTransactions}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {txns.map((t) => (
              <li
                key={t.id}
                className="site-card flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p>{t.description}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`font-semibold ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {formatPrice(Math.abs(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {rechargeAmount !== null && (
        <PaymentModal
          amount={rechargeAmount}
          purpose="recharge"
          title={p.rechargeTitle}
          onClose={() => setRechargeAmount(null)}
          onSuccess={async () => {
            setRechargeAmount(null);
            await refresh();
            const [w, d] = await Promise.all([
              fetch("/api/auth/wallet").then((r) => (r.ok ? r.json() : [])),
              fetch("/api/auth/draws").then((r) => (r.ok ? r.json() : [])),
            ]);
            setTxns(w);
            setDraws(d);
          }}
        />
      )}
    </div>
  );
}
