"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";

export default function Hero() {
  const { messages: m } = useI18n();
  const h = m.hero;

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
        <p className="text-sm font-medium uppercase tracking-widest text-white/60">
          {h.eyebrow}
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
          {h.title}
        </h1>
        <p className="mt-4 max-w-lg text-lg text-white/70">{h.subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/products/iphone-17-pro"
            className="rounded-full bg-[var(--color-brand)] px-8 py-3 text-sm font-medium transition hover:bg-[var(--color-brand-hover)]"
          >
            {h.buyNow}
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            {h.browseAll}
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,113,227,0.15)_0%,_transparent_70%)]" />
    </section>
  );
}
