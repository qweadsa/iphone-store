"use client";

import { useI18n } from "@/lib/i18n-context";
import { injectConfigPrice } from "@/lib/locale-resolve";
import { useBlindBoxCheckout } from "@/lib/use-blindbox-checkout";
import BlindBoxOpenPrice from "@/components/BlindBoxOpenPrice";

type Props = {
  fullPrice: number;
  priceLabel: string;
  buttonLabel: string;
  alwaysVisible?: boolean;
};

export default function MobileFixedCta({
  fullPrice,
  priceLabel,
  buttonLabel,
  alwaysVisible = true,
}: Props) {
  const { locale, messages: m } = useI18n();
  const checkout = useBlindBoxCheckout(fullPrice);
  const drawLabel = injectConfigPrice(m.blindBox.drawNow, checkout.cashDue, locale);

  if (!alwaysVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[rgba(3,3,10,0.86)] px-4 py-3 backdrop-blur-[18px] md:hidden"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <BlindBoxOpenPrice
            fullPrice={fullPrice}
            size="compact"
            showWalletNote={false}
            perOpenLabel={priceLabel}
          />
        </div>
        <a
          href="#draw"
          className="cta-primary cta-breathe flex h-12 shrink-0 items-center justify-center px-5 text-[13px]"
        >
          {buttonLabel.includes("RM") || buttonLabel.includes("$") ? drawLabel : buttonLabel}
        </a>
      </div>
    </div>
  );
}
