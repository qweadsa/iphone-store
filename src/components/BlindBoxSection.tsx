"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { formatMarketPrice, injectConfigPrice } from "@/lib/locale-resolve";
import type { BlindBoxPrize } from "@/types/blindbox";
import { isGrandPrize, isDrawablePrize } from "@/lib/blindbox-prize-utils";
import { resolveGrandPrizeDisplay } from "@/lib/grand-prize-display";
import { calcProbability } from "@/lib/probability";

type Config = {
  price: number;
  grandPrizeName: string;
  grandPrizeValue: string;
  heroTitle?: string;
  heroSubtitle?: string;
  grandPrizeImageUrl?: string | null;
};

type Props = {
  config: Config;
  prizes: BlindBoxPrize[];
};

export default function BlindBoxSection({ config, prizes }: Props) {
  const { messages: m, locale } = useI18n();
  const b = m.blindBox;
  const drawWeight = prizes.filter(isDrawablePrize).reduce((s, p) => s + p.weight, 0);
  const grandPrize = prizes.find(isGrandPrize);
  const grandDisplay = resolveGrandPrizeDisplay(config, prizes);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0a2e] via-[#16082a] to-[#0d1b3e] py-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-amber-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
              {b.badge}
            </span>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              {config.heroTitle ?? b.headline}
            </h2>
            <p className="mt-4 text-lg text-white/70">
              {injectConfigPrice(config.heroSubtitle ?? b.subtitle, config.price, locale)}
            </p>
            <p className="mt-2 text-sm text-white/50">{b.desc}</p>

            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-5xl font-bold text-amber-400">
                {formatMarketPrice(config.price, locale)}
              </span>
              <span className="text-white/60">{b.perDraw}</span>
            </div>

            {grandPrize && (
              <p className="mt-3 text-sm text-amber-300/80">
                🏆 {grandDisplay.name} — {calcProbability(grandPrize.weight, drawWeight)} chance
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/blindbox"
                className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/25 transition hover:scale-105 hover:shadow-amber-500/40"
              >
                {b.cta}
              </Link>
              <Link
                href="/blindbox"
                className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium transition hover:bg-white/10"
              >
                {b.learnMore}
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="blindbox-float absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-400/30 to-purple-600/30 blur-xl" />
              <div className="blindbox-shake relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl md:h-80 md:w-80">
                {grandDisplay.imageUrl ? (
                  <Image
                    src={grandDisplay.imageUrl}
                    alt={grandDisplay.name}
                    fill
                    className="object-contain p-4 opacity-95"
                    unoptimized
                  />
                ) : (
                  <>
                    <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-white/30" />
                    <div className="text-center">
                      <span className="text-7xl">{grandDisplay.emoji}</span>
                      <p className="mt-3 text-lg font-bold">?</p>
                      <p className="mt-1 text-xs text-white/80">
                        {grandDisplay.name}
                      </p>
                    </div>
                  </>
                )}
                <div className="absolute -right-3 -top-3 rotate-12 rounded-full bg-red-500 px-3 py-1 text-xs font-bold shadow-lg">
                  WIN!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
