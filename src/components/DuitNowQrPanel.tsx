"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/products";
import DuitNowLogo from "@/components/DuitNowLogo";
import type { MethodQr } from "@/lib/payments/types";

const WALLET_CHIPS = [
  { name: "Touch 'n Go", color: "bg-[#0057e7] text-white" },
  { name: "GrabPay", color: "bg-[#00b14f] text-white" },
  { name: "MAE", color: "bg-[#ffc83d] text-[#1a1a1a]" },
  { name: "Boost", color: "bg-[#ea0029] text-white" },
  { name: "ShopeePay", color: "bg-[#ee4d2d] text-white" },
  { name: "Bank App", color: "bg-gray-700 text-white" },
];

type PaymentCopy = {
  loading: string;
  error: string;
  duitnowPaynet: string;
  duitnowTitle: string;
  duitnowAmountLabel: string;
  duitnowScanBanner: string;
  duitnowStep1: string;
  duitnowStep2: string;
  duitnowStep3: string;
  duitnowSupportedLabel: string;
  duitnowSecuredFooter: string;
  openPayLink: string;
};

type Props = {
  loading: boolean;
  activeQr: MethodQr | null;
  amount: number;
  paymentId?: string;
  receiveNote?: string | null;
  p: PaymentCopy;
};

function QrFrame({ children }: { children: React.ReactNode }) {
  const corner =
    "absolute h-5 w-5 border-[#ED0677] border-solid";
  return (
    <div className="relative p-3">
      <span className={`${corner} left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-md`} />
      <span className={`${corner} right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-md`} />
      <span className={`${corner} bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-md`} />
      <span className={`${corner} bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-md`} />
      {children}
    </div>
  );
}

export default function DuitNowQrPanel({
  loading,
  activeQr,
  amount,
  paymentId,
  receiveNote,
  p,
}: Props) {
  if (loading) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#ED0677]/25 bg-white/5">
        <div className="bg-gradient-to-r from-[#ED0677] to-[#b8005c] px-4 py-3">
          <div className="flex items-center gap-3">
            <DuitNowLogo size={36} />
            <div className="h-4 w-32 animate-pulse rounded bg-white/30" />
          </div>
        </div>
        <div className="flex h-[280px] items-center justify-center bg-white">
          <p className="text-sm text-gray-400">{p.loading}</p>
        </div>
      </div>
    );
  }

  if (!activeQr) {
    return (
      <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-center text-sm text-red-600">
        {p.error}
      </div>
    );
  }

  const isStatic = activeQr.staticImage || activeQr.qrDataUrl.startsWith("/");
  const hideUrl =
    !activeQr.url ||
    activeQr.url.includes("/pay/PAY-") ||
    activeQr.url.startsWith("/");

  const steps = [p.duitnowStep1, p.duitnowStep2, p.duitnowStep3];

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#ED0677]/30 shadow-[0_12px_40px_rgba(237,6,119,0.18)]">
      {/* DuitNow header — matches real MY payment gateways */}
      <div className="bg-gradient-to-r from-[#ED0677] via-[#d9056f] to-[#b8005c] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <DuitNowLogo size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">
              {p.duitnowPaynet}
            </p>
            <p className="text-[17px] font-black leading-tight text-white">{p.duitnowTitle}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium text-white/70">{p.duitnowAmountLabel}</p>
            <p className="text-[22px] font-black leading-none text-white">{formatPrice(amount)}</p>
          </div>
        </div>
      </div>

      {/* White checkout body */}
      <div className="bg-white px-4 pb-4 pt-4 text-gray-900">
        <div className="flex items-start gap-2.5 rounded-xl border border-[#ED0677]/15 bg-[#fdf2f8] px-3 py-2.5">
          <span className="mt-0.5 text-lg leading-none" aria-hidden>
            📱
          </span>
          <p className="text-[13px] font-semibold leading-snug text-[#9d174d]">
            {p.duitnowScanBanner}
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <QrFrame>
            <div className="rounded-xl bg-white p-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
              <Image
                src={activeQr.qrDataUrl}
                alt="DuitNow QR"
                width={208}
                height={208}
                className="rounded-lg"
                unoptimized
                priority
              />
            </div>
          </QrFrame>
        </div>

        {paymentId && (
          <p className="mt-3 text-center font-mono text-[11px] text-gray-400">{paymentId}</p>
        )}

        <ol className="mt-4 space-y-2">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-2.5 text-[12px] leading-snug text-gray-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ED0677] text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {!isStatic && !hideUrl && activeQr.url && (
          <p className="mt-3 text-center text-[11px] text-[#ED0677]">
            <a href={activeQr.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
              {p.openPayLink}
            </a>
          </p>
        )}

        {receiveNote && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-800">
            {receiveNote}
          </p>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {p.duitnowSupportedLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WALLET_CHIPS.map((w) => (
              <span
                key={w.name}
                className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${w.color}`}
              >
                {w.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Trust footer strip */}
      <div className="flex items-center justify-center gap-2 border-t border-[#ED0677]/10 bg-[#1e1e2e] px-4 py-2.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z"
            fill="#ED0677"
            fillOpacity="0.9"
          />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-[10px] font-medium text-white/60">{p.duitnowSecuredFooter}</p>
      </div>
    </div>
  );
}
