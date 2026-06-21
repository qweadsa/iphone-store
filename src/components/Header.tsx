"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/user-context";
import { useI18n } from "@/lib/i18n-context";
import { formatPrice } from "@/lib/products";
import LanguageSwitcher from "./LanguageSwitcher";

function priceLocale(locale: string) {
  if (locale === "zh") return "zh-CN";
  return locale;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        d="M12 7v10M9.25 10.25c0-1.25 1.25-1.75 2.75-1.75s2.75.5 2.75 1.75-1.25 1.75-2.75 1.75-2.75.5-2.75 1.75 1.25 1.75 2.75 1.75 2.75-.5 2.75-1.75"
      />
    </svg>
  );
}

export default function Header() {
  const { itemCount } = useCart();
  const { user, loading } = useUser();
  const { messages: m, locale } = useI18n();
  const [supportUrl, setSupportUrl] = useState<string | null>(null);
  const [supportChannel, setSupportChannel] = useState<"telegram" | "whatsapp" | null>(null);
  const [contactLoaded, setContactLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/site/contact")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setSupportUrl(d?.supportUrl ?? null);
        setSupportChannel(d?.supportChannel ?? null);
      })
      .catch(() => {
        setSupportUrl(null);
        setSupportChannel(null);
      })
      .finally(() => setContactLoaded(true));
  }, []);

  const nav: {
    href: string;
    label: string;
    icon: string;
    highlight?: boolean;
  }[] = [
    { href: "/#story", label: m.nav.story, icon: "📢", highlight: true },
    { href: "/#draw", label: m.nav.blindBox, icon: "🎁", highlight: true },
    { href: "/products", label: m.nav.shop, icon: "📱" },
    { href: "/orders", label: m.nav.orders, icon: "📋" },
    { href: "/prize/claim", label: m.nav.claimPrize, icon: "📦" },
  ];

  const userLabel = user?.name?.trim() || user?.email?.split("@")[0] || m.nav.login;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[rgba(3,3,10,0.82)] text-[#F5F5F7] backdrop-blur-[16px]">
      <div className="mx-auto flex h-[54px] min-w-0 max-w-6xl items-center justify-between gap-2 overflow-x-clip px-3 sm:gap-3 sm:px-6">
        <Link href="/" prefetch={false} className="shrink-0 text-[13px] font-bold tracking-tight sm:text-[14px]">
          🎁 Mystery Box
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`text-sm transition ${
                item.highlight
                  ? "font-bold text-[#FFB800] hover:text-[#FF7A00]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-[60] flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <Link
                href="/account"
                prefetch={false}
                className="max-w-[120px] truncate rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white/85 transition hover:bg-white/15 sm:max-w-[160px]"
                title={user.email}
              >
                <span className="text-white/55">{m.nav.welcome}</span>{" "}
                <span className="font-semibold text-white">{userLabel}</span>
              </Link>
              <Link
                href="/account"
                prefetch={false}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-[13px] font-medium transition hover:bg-white/15 sm:px-3"
                title={m.nav.wallet}
              >
                <DollarIcon className="h-4 w-4 shrink-0 text-[#FFB800]" />
                <span className="hidden text-white/60 sm:inline">{m.nav.wallet}</span>
                <span className="font-bold tabular-nums text-[#FFB800]">
                  {formatPrice(user.balance, priceLocale(locale))}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-medium transition hover:bg-white/15"
            >
              {loading ? "…" : m.nav.login}
            </Link>
          )}

          <Link
            href="/cart"
            prefetch={false}
            className="relative flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-sm font-medium transition hover:bg-white/15 sm:px-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <span className="hidden sm:inline">{m.nav.cart}</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB800] text-xs font-bold text-[#03030A]">
                {itemCount}
              </span>
            )}
          </Link>

          {contactLoaded &&
            (supportUrl ? (
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] font-medium ring-1 transition sm:px-3 sm:text-[13px] ${
                  supportChannel === "whatsapp"
                    ? "bg-[#25D366]/15 text-[#7ee8a3] ring-[#25D366]/30 hover:bg-[#25D366]/25"
                    : "bg-[#229ED9]/15 text-[#5ebef7] ring-[#229ED9]/30 hover:bg-[#229ED9]/25"
                }`}
                title={m.nav.support}
              >
                {supportChannel === "whatsapp" ? (
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <TelegramIcon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden sm:inline">{m.nav.support}</span>
              </a>
            ) : (
              <span
                className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 text-[12px] font-medium text-white/35 ring-1 ring-white/10 sm:px-3 sm:text-[13px]"
                title={m.nav.supportPending}
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 opacity-50" />
                <span className="hidden sm:inline">{m.nav.support}</span>
              </span>
            ))}
        </div>
      </div>

      <nav
        className="border-t border-white/[0.06] bg-[rgba(3,3,10,0.88)] md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-1 px-1.5 py-2 sm:px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition active:scale-[0.98] ${
                item.highlight
                  ? "border-[#FFB800]/35 bg-[#FFB800]/10 text-[#FFB800]"
                  : "border-white/[0.08] bg-white/[0.05] text-white/75 hover:border-white/15 hover:bg-white/[0.08]"
              }`}
            >
              <span className="text-[15px] leading-none" aria-hidden>
                {item.icon}
              </span>
              <span className="mt-1 line-clamp-2 text-[10px] font-semibold leading-tight sm:text-[11px]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
