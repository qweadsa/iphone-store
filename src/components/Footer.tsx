"use client";

import { useI18n } from "@/lib/i18n-context";
import { normalizeMarketText } from "@/lib/market";

export default function Footer() {
  const { messages: m } = useI18n();
  const f = m.footer;

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#07050f] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold">🎁 Mystery Box</p>
            <p className="mt-2 text-sm text-white/50">
              {normalizeMarketText("$60 to win iPhone 17 Pro Max. Free global shipping.")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">{f.help}</p>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              {f.helpItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">{f.contact}</p>
            <ul className="mt-3 space-y-2 text-sm text-white/50">
              <li>{f.phone}</li>
              <li>{f.hours}</li>
              <li>
                <a
                  href={`mailto:${f.email}`}
                  className="transition hover:text-[#FFB800]"
                >
                  {f.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} iPhone Store. {f.copyright}
        </p>
      </div>
    </footer>
  );
}
