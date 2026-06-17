"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useUser } from "@/lib/user-context";
import type { BlindBoxPrize } from "@/types/blindbox";
import { buildReelPool, prizeToReelItem, type ReelItem } from "@/lib/case-reel-items";
import { displayPrizeName } from "@/lib/prize-display";
import PaymentModal from "./PaymentModal";
import GrandConfetti from "./GrandConfetti";
import { injectConfigPrice } from "@/lib/locale-resolve";
import { useBlindBoxCheckout } from "@/lib/use-blindbox-checkout";

const CaseOpeningReel = dynamic(() => import("./CaseOpeningReel"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex h-[168px] max-w-4xl items-center justify-center rounded-2xl border border-white/10 bg-[#050507]/95 text-sm text-white/40">
      Loading reel...
    </div>
  ),
});

type DrawPhase = "idle" | "spinning" | "done";

type Config = {
  price: number;
  grandPrizeName: string;
};

type Props = {
  prizes: BlindBoxPrize[];
  config: Config;
  theme?: "light" | "dark";
};

export default function BlindBoxGame({ prizes, config, theme = "light" }: Props) {
  const router = useRouter();
  const { user, refresh } = useUser();
  const isDark = theme === "dark";
  const { messages: m, locale } = useI18n();
  const b = m.blindBox;
  const p = m.payment;
  const a = m.auth;

  const [phase, setPhase] = useState<DrawPhase>("idle");
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [result, setResult] = useState<BlindBoxPrize | null>(null);
  const [reelWinner, setReelWinner] = useState<ReelItem | null>(null);
  const [fulfillment, setFulfillment] = useState<{
    type: string;
    amount?: number;
    code?: string;
    discount?: string;
  } | null>(null);
  const [drawPaymentId, setDrawPaymentId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderEmail, setOrderEmail] = useState<string | null>(null);
  const [showOrderReceipt, setShowOrderReceipt] = useState(false);
  const [credited, setCredited] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsShipping, setNeedsShipping] = useState(false);
  const [drawError, setDrawError] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [fetching, setFetching] = useState(false);
  const checkout = useBlindBoxCheckout(config.price);

  const reelPool = useMemo(() => {
    try {
      return buildReelPool(prizes, locale);
    } catch {
      return buildReelPool([], locale);
    }
  }, [prizes, locale]);

  const loginHref = drawPaymentId
    ? `/login?next=${encodeURIComponent("/account")}&claimPayment=${encodeURIComponent(drawPaymentId)}`
    : "/login?next=%2Faccount";

  const trackOrderHref =
    orderNumber && orderEmail
      ? `/orders?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(orderEmail)}`
      : orderNumber
        ? `/orders?orderNumber=${encodeURIComponent(orderNumber)}`
        : "/orders";

  const handleSpinComplete = useCallback(() => {
    setPhase("done");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (phase !== "done" || !orderNumber) return;
    const t = window.setTimeout(() => setShowOrderReceipt(true), 2000);
    return () => window.clearTimeout(t);
  }, [phase, orderNumber]);

  async function finishOrderReceipt(viewOrders: boolean) {
    setShowOrderReceipt(false);

    if (viewOrders) {
      router.push(trackOrderHref);
      return;
    }

    if (!fulfillment || !drawPaymentId) return;

    if (fulfillment.type === "credit") {
      if (needsLogin || !user) {
        router.push(loginHref);
        return;
      }
      if (!credited) {
        try {
          const res = await fetch("/api/blindbox/claim-credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: drawPaymentId }),
          });
          const data = await res.json();
          if (data.credited) {
            setCredited(true);
            await refresh();
          }
        } catch {
          /* ignore */
        }
      }
      return;
    }

    if (
      needsShipping &&
      (fulfillment.type === "grand" || fulfillment.type === "case")
    ) {
      router.push(`/prize/claim?paymentId=${encodeURIComponent(drawPaymentId)}`);
    }
  }

  async function runDraw(paymentId: string) {
    setDrawError("");
    setFetching(true);
    setOrderNumber(null);
    setOrderEmail(null);
    setShowOrderReceipt(false);

    try {
      const res = await fetch("/api/blindbox/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDrawError(data.error ?? b.drawFailed);
        return;
      }

      setFulfillment(data.fulfillment ?? null);
      setDrawPaymentId(data.paymentId ?? paymentId);
      setCredited(!!data.credited);
      setNeedsLogin(!!data.needsLogin);
      setNeedsShipping(!!data.needsShipping);

      if (data.orderNumber) {
        setOrderNumber(data.orderNumber);
        setOrderEmail(data.orderEmail ?? null);
      }

      const prize =
        prizes.find((x) => x.key === data.prize.key) ??
        ({
          key: data.prize.key,
          name: data.prize.name,
          weight: 0,
          emoji: "🎁",
          fulfillmentType: data.prize.fulfillmentType,
        } as BlindBoxPrize);

      const nextSpin = spinTrigger + 1;
      setSpinTrigger(nextSpin);
      setResult(prize);
      setReelWinner(prizeToReelItem(prize, locale, nextSpin));
      setPhase("spinning");
    } catch {
      setDrawError(b.drawFailed);
    } finally {
      setFetching(false);
    }
  }

  function handleDrawClick() {
    if (phase === "spinning" || fetching) return;
    setShowPay(true);
  }

  const isGrandWin =
    phase === "done" &&
    (result?.fulfillmentType === "grand" || result?.tier === "legendary");

  const isCreditWin = phase === "done" && fulfillment?.type === "credit";
  const isRetryWin = phase === "done" && fulfillment?.type === "retry";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-12">
      <GrandConfetti active={isGrandWin} />

      <CaseOpeningReel
        pool={reelPool}
        phase={phase}
        winner={reelWinner}
        spinTrigger={spinTrigger}
        onSpinComplete={handleSpinComplete}
      />

      <p className="mt-4 text-center text-[12px] uppercase tracking-[0.2em] text-white/35">
        {fetching && (locale === "ms" ? "Membuka..." : locale === "zh" ? "正在开启..." : "Opening...")}
        {!fetching && phase === "idle" && (locale === "ms" ? "Pratonton kolam hadiah · gaya buka kotak" : locale === "zh" ? "向左滚动预览奖池 · CS 开箱风格" : "Scroll preview · CS case opening style")}
        {!fetching && phase === "spinning" && b.drawing}
        {!fetching && phase === "done" && b.youWon}
      </p>

      {phase === "done" && result && !isRetryWin && (
        <div className="mt-6 animate-fade-in text-center">
          <p className="text-2xl font-bold text-[#FFB800]">{b.youWon}</p>
          <p className={`mt-2 text-lg ${isDark ? "text-white/60" : "text-[var(--color-muted)]"}`}>
            {b.youGot}{" "}
            <span className={`font-semibold ${isDark ? "text-white" : "text-[var(--color-ink)]"}`}>
              {displayPrizeName(result, locale)}
            </span>
          </p>
          {isCreditWin && credited && !showOrderReceipt && (
            <p className="mt-2 text-sm font-medium text-green-500">{a.prizeCredited}</p>
          )}
          {isCreditWin && !credited && !showOrderReceipt && (
            <p className="mt-2 text-sm font-medium text-amber-400">{a.prizeCreditLogin}</p>
          )}
          {fulfillment?.type === "coupon" && fulfillment.code && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {a.couponWon}: <span className="font-mono font-bold">{fulfillment.code}</span>
            </p>
          )}
        </div>
      )}

      {drawError && <p className="mt-4 text-center text-sm text-red-500">{drawError}</p>}

      <div className="mt-8 flex flex-col items-center gap-3">
        {isCreditWin && !credited && !showOrderReceipt ? (
          <Link
            href={loginHref}
            className="cta-breathe w-full max-w-md rounded-full bg-gradient-to-br from-[#FFB800] via-[#FF7A00] to-[#FF2D2D] px-10 py-4 text-center text-sm font-bold text-[#03030A] shadow-[0_16px_40px_rgba(255,122,0,0.35)] transition hover:scale-105 sm:w-auto"
          >
            {a.loginToClaimCredit}
          </Link>
        ) : isCreditWin && credited ? (
          <Link
            href="/account"
            className="cta-breathe w-full max-w-md rounded-full bg-gradient-to-br from-[#FFB800] via-[#FF7A00] to-[#FF2D2D] px-10 py-4 text-center text-sm font-bold text-[#03030A] shadow-[0_16px_40px_rgba(255,122,0,0.35)] transition hover:scale-105 sm:w-auto"
          >
            {a.goToWallet}
          </Link>
        ) : null}

        {!isCreditWin || credited ? (
          <button
            onClick={handleDrawClick}
            disabled={phase === "spinning" || fetching || showOrderReceipt}
            className={`w-full max-w-md rounded-full px-10 py-4 text-sm font-bold transition hover:scale-105 disabled:opacity-50 sm:w-auto ${
              isCreditWin && credited
                ? "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                : "cta-breathe bg-gradient-to-br from-[#FFB800] via-[#FF7A00] to-[#FF2D2D] text-[#03030A] shadow-[0_16px_40px_rgba(255,122,0,0.35)]"
            }`}
          >
            {phase === "done"
              ? injectConfigPrice(b.tryAgainBtn, checkout.cashDue, locale)
              : injectConfigPrice(b.drawNow, checkout.cashDue, locale)}
          </button>
        ) : null}
      </div>

      <p className={`mt-8 text-center text-xs ${isDark ? "text-white/40" : "text-[var(--color-muted)]"}`}>
        {b.disclaimer}
      </p>

      {showPay && (
        <PaymentModal
          amount={checkout.cashDue}
          purpose="blindbox"
          title={p.blindboxTitle}
          onClose={() => setShowPay(false)}
          onSuccess={(paymentId) => {
            setShowPay(false);
            runDraw(paymentId);
          }}
        />
      )}

      {showOrderReceipt && orderNumber && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#FFB800]/30 bg-[#0a0a12] p-8 text-center shadow-[0_24px_80px_rgba(255,184,0,0.15)]">
            <p className="text-5xl">🎫</p>
            <h2 className="mt-4 text-2xl font-bold text-white">{b.drawOrderTitle}</h2>
            <p className="mt-2 text-sm text-white/60">{b.drawOrderDesc}</p>
            <p className="mt-5 rounded-xl border border-[#FFB800]/25 bg-[#FFB800]/10 px-4 py-3 font-mono text-xl font-bold tracking-wide text-[#FFB800]">
              {orderNumber}
            </p>
            {orderEmail && (
              <p className="mt-3 text-sm text-white/50">
                {b.drawOrderEmail}: <span className="text-white/80">{orderEmail}</span>
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => finishOrderReceipt(false)}
                className="flex-1 rounded-full border border-white/20 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {b.orderDismiss}
              </button>
              <button
                type="button"
                onClick={() => finishOrderReceipt(true)}
                className="flex-1 rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF7A00] py-3 text-sm font-bold text-[#03030A]"
              >
                {b.trackOrder}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
