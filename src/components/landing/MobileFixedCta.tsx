"use client";

import { useI18n } from "@/lib/i18n-context";
import { formatMarketPrice } from "@/lib/locale-resolve";

type Props = {
  price: number;
  priceLabel: string;
  buttonLabel: string;
  alwaysVisible?: boolean;
};

export default function MobileFixedCta({
  price,
  priceLabel,
  buttonLabel,
  alwaysVisible = true,
}: Props) {
  const { locale } = useI18n();

  if (!alwaysVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[rgba(3,3,10,0.86)] px-4 py-3 backdrop-blur-[18px] md:hidden"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[22px] font-black leading-none text-[#FFB800]">
            {formatMarketPrice(price, locale)}
          </p>
          <p className="mt-0.5 text-[11px] text-white/55">{priceLabel}</p>
        </div>
        <a
          href="#draw"
          className="cta-breathe flex h-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB800] via-[#FF7A00] to-[#FF2D2D] px-8 text-[15px] font-bold text-[#03030A] shadow-[0_12px_32px_rgba(255,122,0,0.35)]"
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}
