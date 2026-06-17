"use client";

import { useEffect, useMemo, useState } from "react";

export type LiveWinnerItem = {
  id: number | string;
  text: string;
  isGrand?: boolean;
  timeLabel: string;
  icon?: string;
};

type Props = {
  title: string;
  subtitle: string;
  emptyText: string;
  items: LiveWinnerItem[];
};

const ROW_H = 48;
const VISIBLE = 4;

function iconForItem(isGrand?: boolean, icon?: string) {
  if (icon) return icon;
  return isGrand ? "🏆" : "🎁";
}

export default function LiveWinnerFeed({ title, subtitle, emptyText, items }: Props) {
  const [index, setIndex] = useState(0);

  const looped = useMemo(() => {
    if (items.length === 0) return [];
    return [...items, ...items.slice(0, VISIBLE)];
  }, [items]);

  useEffect(() => {
    if (items.length <= VISIBLE) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 2500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5">
        <p className="text-base font-bold text-[#F5F5F7]">{title}</p>
        <p className="mt-1 text-[13px] text-white/50">{subtitle}</p>
        <p className="mt-10 text-center text-sm text-white/40">{emptyText}</p>
      </div>
    );
  }

  const feedHeight = Math.min(VISIBLE, items.length) * ROW_H + 16;

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 sm:p-5">
      <p className="text-base font-bold text-[#F5F5F7]">{title}</p>
      <p className="mt-1 text-[13px] text-white/50">{subtitle}</p>

      <div className="relative mt-3 overflow-hidden rounded-2xl" style={{ height: feedHeight }}>
        <div
          className="transition-transform duration-700 ease-in-out"
          style={{ transform: `translateY(-${index * ROW_H}px)` }}
        >
          {looped.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className={`mb-2 flex h-11 items-center gap-2.5 rounded-xl border px-3 sm:h-12 sm:gap-3 ${
                item.isGrand
                  ? "border-[#FFB800]/40 bg-[#FFB800]/10"
                  : "border-white/[0.06] bg-white/[0.04]"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm">
                {iconForItem(item.isGrand, item.icon)}
              </span>
              <p
                className={`min-w-0 flex-1 truncate text-[12px] sm:text-[13px] ${
                  item.isGrand ? "font-semibold text-[#FFB800]" : "text-[#F5F5F7]/88"
                }`}
              >
                {item.text}
              </p>
              <span className="shrink-0 text-[10px] text-white/40 sm:text-[11px]">
                {item.timeLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
