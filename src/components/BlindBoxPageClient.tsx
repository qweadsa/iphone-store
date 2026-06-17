"use client";

import BlindBoxGame from "@/components/BlindBoxGame";
import { useI18n } from "@/lib/i18n-context";
import { getPrizeDisplayOdds } from "@/lib/probability";
import { isDrawablePrize, isPoolVisiblePrize } from "@/lib/blindbox-prize-utils";
import { displayPrizeName } from "@/lib/prize-display";
import { injectConfigPrice } from "@/lib/locale-resolve";
import type { BlindBoxPrize } from "@/types/blindbox";

type Config = {
  price: number;
  grandPrizeName: string;
  grandPrizeValue: string;
  grandPrizeImageUrl?: string | null;
};

type Props = {
  config: Config;
  prizes: BlindBoxPrize[];
};

export default function BlindBoxPageClient({ config, prizes }: Props) {
  const { messages: m, locale } = useI18n();
  const b = m.blindBox;
  const steps = [
    injectConfigPrice(b.step1, config.price, locale),
    b.step2,
    b.step3,
  ];
  const drawWeight = prizes.filter(isDrawablePrize).reduce((s, p) => s + p.weight, 0);
  const visiblePrizes = prizes
    .filter(isPoolVisiblePrize)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const loc = locale === "ms" ? "ms" : locale === "zh" ? "zh" : "en";

  return (
    <>
      <section className="bg-gradient-to-br from-[#1a0a2e] via-[#16082a] to-[#0d1b3e] py-16 text-center text-white">
        <span className="inline-block rounded-full bg-amber-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
          {b.badge}
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {b.pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-white/70">{b.pageSubtitle}</p>

        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="text-5xl">📱</div>
          <div className="text-left">
            <p className="text-xs uppercase tracking-widest text-amber-400">
              {b.grandPrize}
            </p>
            <p className="text-xl font-bold">{config.grandPrizeName}</p>
            <p className="text-sm text-white/60">{config.grandPrizeValue}</p>
          </div>
        </div>
      </section>

      <BlindBoxGame prizes={prizes} config={config} />

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-center text-2xl font-bold">{b.howItWorks}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step}
              className="rounded-2xl bg-[var(--color-surface)] p-6 text-center"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)] text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-4 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-12 text-center text-xl font-bold">
          {b.otherPrizes} — 概率公示
        </h3>
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-surface)]">
              <tr>
                <th className="px-4 py-3 font-medium">奖品</th>
                <th className="px-4 py-3 font-medium">概率</th>
              </tr>
            </thead>
            <tbody>
              {visiblePrizes.map((prize) => (
                <tr key={prize.id ?? prize.key} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    {prize.emoji} {displayPrizeName(prize, loc)}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-brand)]">
                    {getPrizeDisplayOdds(prize, drawWeight, loc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-black/5 px-4 py-3 text-xs text-[var(--color-muted)]">
            {b.oddsNote}
          </p>
        </div>
      </section>
    </>
  );
}
