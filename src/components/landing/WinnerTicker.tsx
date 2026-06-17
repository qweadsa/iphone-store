"use client";

import { useEffect, useState } from "react";

export type WinnerItem = {
  id: number | string;
  text: string;
  isGrand?: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  emptyText: string;
  items: WinnerItem[];
};

export default function WinnerTicker({ title, subtitle, emptyText, items }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 2500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.06] p-5">
        <p className="text-base font-bold text-[#F5F5F7]">{title}</p>
        <p className="mt-1 text-[13px] text-white/50">{subtitle}</p>
        <p className="mt-8 text-center text-sm text-white/40">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.06] p-5">
      <p className="text-base font-bold text-[#F5F5F7]">{title}</p>
      <p className="mt-1 text-[13px] text-white/50">{subtitle}</p>
      <div className="relative mt-4 h-[120px] overflow-hidden">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`absolute inset-x-0 top-0 flex items-start gap-3 transition-all duration-500 ${
              i === index
                ? "translate-y-0 opacity-100"
                : i < index
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0"
            }`}
          >
            <span
              className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${
                item.isGrand ? "bg-[#FFB800] shadow-[0_0_8px_#FFB800]" : "bg-white/40"
              }`}
            />
            <p
              className={`text-[14px] leading-relaxed ${
                item.isGrand ? "font-semibold text-[#FFB800]" : "text-[#F5F5F7]/90"
              }`}
            >
              {item.isGrand && "🏆 "}
              {item.text}
            </p>
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-4 bg-[#FFB800]" : "w-1 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
