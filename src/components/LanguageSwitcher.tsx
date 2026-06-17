"use client";

import { useEffect, useRef, useState } from "react";
import { localeFlags, localeLabels, locales } from "@/i18n/config";
import { useI18n } from "@/lib/i18n-context";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15"
        aria-label="Select language"
      >
        <span>{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-white/50 transition ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-[#0c0c14] py-1 shadow-xl">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setLocale(loc);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/5 ${
                locale === loc ? "font-semibold text-[#FFB800]" : "text-white/80"
              }`}
            >
              <span className="text-base leading-none">{localeFlags[loc]}</span>
              <span className="leading-snug">{localeLabels[loc]}</span>
              {locale === loc && <span className="ml-auto text-[#FFB800]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
