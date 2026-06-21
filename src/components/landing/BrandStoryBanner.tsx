"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

export default function BrandStoryBanner() {
  const { messages: m } = useI18n();
  const s = m.landing.brandStory;
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="story"
      className="scroll-mt-[118px] border-b-2 border-[#FFB800]/40 bg-[#0a0812] px-4 pb-5 pt-[76px] md:scroll-mt-20 md:px-6 md:pb-6 md:pt-[84px]"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[20px] border-2 border-[#FFB800]/45 bg-gradient-to-br from-[#FFB800]/[0.12] via-[#FF5A1F]/[0.06] to-white/[0.04] p-4 shadow-[0_0_64px_rgba(255,184,0,0.15)] sm:p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,184,0,0.15)_0%,transparent_70%)]" />

          <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB800]/35 bg-[#FFB800]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#FFB800]">
                {s.badge}
              </span>

              <h2 className="mt-3 text-[20px] font-black leading-snug text-[#F5F5F7] sm:text-[24px] md:text-[28px]">
                {s.title}
              </h2>

              <p className="mt-3 text-[14px] leading-relaxed text-white/72 sm:text-[15px]">{s.lead}</p>

              <div
                className={`mt-3 space-y-3 text-[13px] leading-relaxed text-white/58 sm:text-[14px] ${
                  expanded ? "block" : "hidden md:block"
                }`}
              >
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
                <p className="font-medium text-[#FFB800]/90">{s.prizeLine}</p>
                <p>{s.thanks}</p>
                <p className="italic text-white/70">{s.closing}</p>
                <p className="font-semibold text-[#FFB800]">{s.wishes}</p>
              </div>

              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 text-[13px] font-semibold text-[#FFB800] underline-offset-2 hover:underline md:hidden"
              >
                {expanded ? s.readLess : s.readMore}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                {s.highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center"
                  >
                    <p className="text-xl">{item.icon}</p>
                    <p className="mt-1 text-[15px] font-black text-[#FFB800]">{item.value}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-red-300/90">
                  {s.urgencyLabel}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/65">{s.urgencyText}</p>
              </div>

              <a
                href="#draw"
                className="cta-primary cta-breathe mt-auto flex h-12 items-center justify-center text-[14px] sm:h-[52px]"
              >
                {s.cta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
