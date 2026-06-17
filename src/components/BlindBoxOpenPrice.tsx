"use client";

import { useI18n } from "@/lib/i18n-context";
import { formatMarketPrice } from "@/lib/locale-resolve";
import { useBlindBoxCheckout } from "@/lib/use-blindbox-checkout";

type Props = {
  fullPrice: number;
  size?: "hero" | "compact";
  showWalletNote?: boolean;
  perOpenLabel?: string;
};

export default function BlindBoxOpenPrice({
  fullPrice,
  size = "hero",
  showWalletNote = true,
  perOpenLabel,
}: Props) {
  const { locale, messages: m } = useI18n();
  const { cashDue, walletUse, hasWalletDiscount } = useBlindBoxCheckout(fullPrice);
  const b = m.blindBox;

  const mainClass =
    size === "hero" ? "text-[40px] font-black text-[#FFB800] lg:text-[44px]" : "text-[22px] font-black text-[#FFB800]";

  const perOpenClass =
    size === "hero" ? "text-[14px] text-white/55" : "text-[11px] text-white/55";

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={mainClass}>{formatMarketPrice(cashDue, locale)}</span>
        {perOpenLabel ? <span className={perOpenClass}>{perOpenLabel}</span> : null}
        {hasWalletDiscount && (
          <span className="text-sm text-white/40 line-through">
            {formatMarketPrice(fullPrice, locale)}
          </span>
        )}
      </div>
      {showWalletNote && hasWalletDiscount && (
        <p className="mt-1 text-[11px] text-emerald-400/90">
          {b.walletDiscountNote
            .replace("{wallet}", formatMarketPrice(walletUse, locale))
            .replace("{cash}", formatMarketPrice(cashDue, locale))}
        </p>
      )}
    </div>
  );
}

export function useBlindBoxPayAmount(fullPrice: number) {
  const checkout = useBlindBoxCheckout(fullPrice);
  return checkout.cashDue;
}
