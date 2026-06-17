"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { formatMarketPrice } from "@/lib/locale-resolve";

type Props = {
  label: string;
  price: number;
};

export default function StickyDrawCta({ label, price }: Props) {
  const { locale } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const formatted = formatMarketPrice(price, locale);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#07050f]/95 p-3 backdrop-blur-lg md:hidden">
      <a
        href="#draw"
        className="landing-cta flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/25"
      >
        {label.replace("{price}", formatted)}
      </a>
    </div>
  );
}
