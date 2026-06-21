"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { localeFlags, localeLabels, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/lib/i18n-context";

function LocaleOptions({
  locale,
  onPick,
  className = "",
}: {
  locale: Locale;
  onPick: (loc: Locale) => void;
  className?: string;
}) {
  return (
    <div className={className} role="listbox" aria-label="Select language">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          role="option"
          aria-selected={locale === loc}
          onClick={() => onPick(loc)}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition active:scale-[0.99] ${
            locale === loc
              ? "bg-[#FFB800]/10 font-semibold text-[#FFB800]"
              : "text-white/85 hover:bg-white/5"
          }`}
        >
          <span className="text-lg leading-none">{localeFlags[loc]}</span>
          <span className="leading-snug">{localeLabels[loc]}</span>
          {locale === loc && <span className="ml-auto text-[#FFB800]">✓</span>}
        </button>
      ))}
    </div>
  );
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open || isMobile) return;
    function handlePointer(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  function pick(next: Locale) {
    setLocale(next);
    setOpen(false);
  }

  const mobileSheet =
    mounted && open && isMobile
      ? createPortal(
          <div className="fixed inset-0 z-[200]" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-black/65"
              aria-label="Close language menu"
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-[24px] border-t border-white/10 bg-[#0c0c14] px-3 pt-4 shadow-[0_-16px_48px_rgba(0,0,0,0.45)]"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <p className="mb-2 text-center text-sm font-semibold text-white/70">
                {locale === "zh" ? "選擇語言" : locale === "ms" ? "Pilih Bahasa" : "Select Language"}
              </p>
              <LocaleOptions locale={locale} onPick={pick} className="space-y-1" />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div ref={ref} className="relative z-[60]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-sm font-medium transition hover:bg-white/15 sm:gap-1.5 sm:px-3"
          aria-label="Select language"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="text-base leading-none sm:text-sm">{localeFlags[locale]}</span>
          <span className="hidden sm:inline">{localeLabels[locale]}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 text-white/50 transition ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && !isMobile && (
          <div className="absolute right-0 top-full z-[70] mt-2 min-w-[200px] rounded-2xl border border-white/10 bg-[#0c0c14] p-1 shadow-xl">
            <LocaleOptions locale={locale} onPick={pick} />
          </div>
        )}
      </div>
      {mobileSheet}
    </>
  );
}
