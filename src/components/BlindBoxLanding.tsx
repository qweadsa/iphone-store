"use client";

import Link from "next/link";
import { useMemo } from "react";
import BlindBoxGame from "@/components/BlindBoxGame";
import HeroRewardPanel from "@/components/landing/HeroRewardPanel";
import MobileFixedCta from "@/components/landing/MobileFixedCta";
import { useI18n } from "@/lib/i18n-context";
import {
  formatPublicWinnerLine,
  formatTimeAgo,
  type GrandPrizeStatus,
  type PublicWinnerRow,
} from "@/lib/blindbox-public";
import { isPoolVisiblePrize, isDrawablePrize } from "@/lib/blindbox-prize-utils";
import { displayPrizeName } from "@/lib/prize-display";
import { getPrizeImageUrl } from "@/lib/prize-images";
import PrizeVisual from "@/components/PrizeVisual";
import { getPrizeDisplayOdds } from "@/lib/probability";
import type { BlindBoxPrize } from "@/types/blindbox";
import type { Product } from "@/types/product";

function PoolPrizeCard({
  prize,
  locale,
  drawWeight,
  featured = false,
}: {
  prize: BlindBoxPrize;
  locale: string;
  drawWeight: number;
  featured?: boolean;
}) {
  const name = displayPrizeName(prize, locale);
  const odds = getPrizeDisplayOdds(prize, drawWeight, locale === "zh" ? "zh" : "en");

  return (
    <div
      className={`prize-card-hover flex min-h-[118px] flex-col items-center justify-between rounded-[18px] border p-3 text-center sm:min-h-[132px] sm:rounded-[20px] sm:p-4 ${
        featured
          ? "border-[#FFB800]/40 bg-gradient-to-br from-[#FFB800]/10 to-[#FF5A1F]/5 shadow-[0_0_32px_rgba(255,184,0,0.12)]"
          : "border-white/[0.08] bg-white/[0.06]"
      }`}
    >
      <div className="flex w-full flex-col items-center">
        <PrizeVisual
          imageUrl={getPrizeImageUrl(prize)}
          emoji={prize.emoji}
          alt={name}
          size={featured ? "lg" : "sm"}
        />
        <p
          className={`mt-2 line-clamp-2 w-full font-semibold leading-snug ${
            featured ? "text-[14px] text-[#FFB800] sm:text-[15px]" : "text-[12px] text-[#F5F5F7] sm:text-[13px]"
          }`}
        >
          {name}
        </p>
      </div>
      <p className="mt-2 text-[10px] font-medium text-[#FFB800]/90 sm:text-[11px]">{odds}</p>
    </div>
  );
}

function GoldLine({
  text,
  gold,
  baseClass = "",
}: {
  text: string;
  gold: string;
  baseClass?: string;
}) {
  const idx = text.indexOf(gold);
  if (idx === -1) {
    return <span className={baseClass}>{text}</span>;
  }
  return (
    <span className={baseClass}>
      {text.slice(0, idx)}
      <span className="bg-gradient-to-r from-[#FFB800] via-[#FF7A00] to-[#FFB800] bg-clip-text text-transparent">
        {gold}
      </span>
      {text.slice(idx + gold.length)}
    </span>
  );
}

type Config = {
  price: number;
  enabled: boolean;
  grandPrizeName: string;
  grandPrizeValue: string;
  heroTitle?: string;
  heroSubtitle?: string;
  grandPrizeImageUrl?: string | null;
  winnersDemoMode?: boolean;
};

type Stats = {
  playersToday: number;
  winnersToday: number;
  grandPrizeStatus: GrandPrizeStatus;
};

type Props = {
  config: Config;
  prizes: BlindBoxPrize[];
  products: (Product & { imageUrl?: string | null })[];
  stats?: Stats;
  publicWinners?: PublicWinnerRow[];
  renderedAt?: number;
};

export default function BlindBoxLanding({
  config,
  prizes,
  products,
  stats,
  publicWinners = [],
  renderedAt,
}: Props) {
  const { messages: m, locale } = useI18n();
  const b = m.blindBox;
  const l = m.landing;
  const mob = l.mobile;
  const a = m.auth;

  const drawWeight = prizes.filter(isDrawablePrize).reduce((s, p) => s + p.weight, 0);
  const visiblePrizes = useMemo(
    () =>
      prizes
        .filter(isPoolVisiblePrize)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [prizes],
  );
  const featuredPrizes = visiblePrizes.slice(0, 2);
  const restPrizes = visiblePrizes.slice(2);

  const grandStatusLabel =
    stats?.grandPrizeStatus === "claimed" ? l.grandClaimed : l.grandAvailable;

  const statsCards = [
    {
      n: (stats?.playersToday ?? 0).toLocaleString(),
      label: l.playersToday,
    },
    {
      n: (stats?.winnersToday ?? 0).toLocaleString(),
      label: l.winnersToday,
    },
    {
      n: grandStatusLabel,
      label: l.grandPrizeStat,
      isText: true,
    },
  ];

  const winnerItems = useMemo(() => {
    const nowMs = renderedAt ?? Date.now();
    if (publicWinners.length > 0) {
      return publicWinners.map((r) => ({
        id: r.id,
        text: formatPublicWinnerLine(r.prizeName, r.email, r.prizeType, locale),
        isGrand: r.prizeType === "grand",
        timeLabel: formatTimeAgo(r.createdAt, locale, nowMs),
        icon: r.prizeType === "grand" ? "🏆" : r.prizeType === "credit" ? "💰" : "🎁",
      }));
    }
    if (config.winnersDemoMode !== false) {
      return l.winners.map((text, i) => ({
        id: `demo-${i}`,
        text,
        isGrand: text.toLowerCase().includes("iphone") || text.includes("大奖"),
        timeLabel: i === 0 ? (locale === "zh" ? "刚刚" : "Just now") : locale === "zh" ? `${i * 2} 分钟前` : `${i * 2} min ago`,
        icon: text.toLowerCase().includes("iphone") ? "🏆" : "🎁",
      }));
    }
    return [];
  }, [publicWinners, config.winnersDemoMode, locale, l.winners, renderedAt]);

  const floatingChips = useMemo(() => {
    const legendary = prizes.find((p) => p.tier === "legendary" && isPoolVisiblePrize(p));
    const epic = prizes.find((p) => p.tier === "epic" && isPoolVisiblePrize(p));
    const rare = prizes.find((p) => p.tier === "rare" && isPoolVisiblePrize(p));
    return [
      {
        label: legendary ? displayPrizeName(legendary, locale) : "iPhone 17 Pro Max",
        emoji: legendary?.emoji ?? "📱",
        className: "top-2 right-2",
      },
      {
        label: epic ? displayPrizeName(epic, locale) : "MacBook Pro",
        emoji: epic?.emoji ?? "💻",
        className: "bottom-4 left-2",
      },
      {
        label: rare ? displayPrizeName(rare, locale) : "RTX 4090",
        emoji: rare?.emoji ?? "🎮",
        className: "top-[18%] -right-2",
      },
    ];
  }, [prizes, locale]);

  const steps = [b.step1.replace("$60", `$${config.price}`), b.step2, b.step3];

  const trustItems = [
    { icon: "🔒", title: l.trustSecure },
    { icon: "🚚", title: l.trustShipping },
    { icon: "✅", title: l.trustAuthentic },
  ];

  if (!config.enabled) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#03030A] px-6 text-center">
        <p className="text-white/60">{a.eventUnavailable}</p>
      </div>
    );
  }

  const panelLabels = {
    grandEyebrow: mob.grandEyebrow,
    grandSubtitle: mob.grandSubtitle,
    winBadge: mob.winBadge,
    winnersTitle: l.winnersTitle,
    winnersSubtitle: l.winnersSubtitle,
    winnersEmpty: l.winnersEmpty,
  };

  return (
    <div className="bg-[#03030A] pb-24 text-[#F5F5F7] md:pb-0">
      <MobileFixedCta
        price={config.price}
        priceLabel={l.perOpen}
        buttonLabel={l.fixedCtaBtn}
      />

      {/* ── 首屏 Hero 双栏 ── */}
      <section className="relative px-4 pt-[72px] md:px-6 md:pt-[80px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,184,0,0.14)_0%,transparent_68%)]" />
          <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.1)_0%,transparent_65%)]" />
        </div>

        <div className="hero-content relative mx-auto grid max-w-7xl items-center gap-6 lg:min-h-[calc(100dvh-70px)] lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
          {/* 左侧：标题 / 价格 / CTA / 信任标签 */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center rounded-full border border-[#FFB800]/30 bg-[#FFB800]/10 px-3 py-1.5 text-[12px] font-semibold text-[#FFB800]">
              {mob.activityTag}
            </span>

            <h1 className="mt-3 text-[40px] font-black leading-[1.05] tracking-tight sm:text-[44px] lg:text-[52px] xl:text-[58px]">
              <GoldLine text={mob.titleLine1} gold={mob.titleHighlight1} />
              <br />
              <GoldLine text={mob.titleLine2} gold={mob.titleHighlight2} baseClass="text-[#F5F5F7]" />
            </h1>

            <p className="mt-3 max-w-lg text-[15px] leading-[1.55] text-[rgba(245,245,247,0.72)]">
              {mob.subtitle}
            </p>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[40px] font-black text-[#FFB800] lg:text-[44px]">${config.price}</span>
              <span className="text-[14px] text-white/55">{l.perOpen}</span>
            </div>

            <div className="mt-[18px] flex flex-col gap-3 sm:max-w-md">
              <a
                href="#draw"
                className="cta-breathe flex h-[58px] w-full items-center justify-center rounded-full bg-gradient-to-br from-[#FFB800] via-[#FF7A00] to-[#FF2D2D] text-[16px] font-bold text-[#03030A] shadow-[0_16px_40px_rgba(255,122,0,0.35)]"
              >
                {b.drawNow.replace("$60", `$${config.price}`)}
              </a>
              <a
                href="#prizes"
                className="text-center text-[14px] font-medium text-white/50 transition hover:text-[#FFB800] lg:text-left"
              >
                {l.viewPool}
              </a>
            </div>

            {/* 手机端：数据卡紧跟按钮 */}
            <div className="mt-[18px] grid grid-cols-3 gap-2.5 lg:hidden">
              {statsCards.map((stat) => (
                <div
                  key={stat.label}
                  className="flex h-[68px] flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] px-1 text-center"
                >
                  <p
                    className={`font-bold leading-none ${
                      stat.isText ? "text-[12px] text-[#FFB800]" : "text-[18px] text-[#FFB800]"
                    }`}
                  >
                    {stat.n}
                  </p>
                  <p className="mt-1 text-[10px] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
              {trustItems.map((item) => (
                <span
                  key={item.title}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/70"
                >
                  <span>{item.icon}</span>
                  {item.title}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧：大奖 + 数据 + 实时名单 */}
          <HeroRewardPanel
            grandPrizeName={config.grandPrizeName}
            grandPrizeValue={config.grandPrizeValue}
            grandPrizeImageUrl={config.grandPrizeImageUrl}
            grandPrizeStatus={stats?.grandPrizeStatus ?? "available"}
            grandStatusLabel={grandStatusLabel}
            statsCards={statsCards}
            winnerItems={winnerItems}
            floatingChips={floatingChips}
            showStats
            statsDesktopOnly
            labels={panelLabels}
          />
        </div>
      </section>

      {/* ── 抽奖区（CS 开箱，优先展示） ── */}
      <section
        id="draw"
        className="border-t border-white/[0.08] bg-gradient-to-b from-[#050507] to-[#03030A] py-14 md:py-20"
      >
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-[26px] font-black md:text-4xl">{b.pageTitle}</h2>
          <p className="mt-2 text-[14px] text-white/55">{b.pageSubtitle}</p>
        </div>
        <BlindBoxGame prizes={prizes} config={config} theme="dark" />
      </section>

      {/* ── 奖池 ── */}
      <section id="prizes" className="border-t border-white/[0.08] px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-[26px] font-black md:text-3xl">{l.poolTitle}</h2>
          <p className="mt-2 text-[14px] text-white/55">{l.poolSubtitle}</p>

          <div className="mt-6 space-y-3 sm:space-y-4">
            {featuredPrizes.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {featuredPrizes.map((prize) => (
                  <PoolPrizeCard
                    key={prize.id ?? prize.key}
                    prize={prize}
                    locale={locale}
                    drawWeight={drawWeight}
                    featured
                  />
                ))}
              </div>
            )}

            {restPrizes.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {restPrizes.map((prize) => (
                  <PoolPrizeCard
                    key={prize.id ?? prize.key}
                    prize={prize}
                    locale={locale}
                    drawWeight={drawWeight}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 如何参与 ── */}
      <section className="border-t border-white/[0.08] px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-[26px] font-black md:text-3xl">{l.howTitle}</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <div
                key={step}
                className="rounded-[20px] border border-white/[0.08] bg-white/[0.06] p-5 text-center"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB800] to-[#FF2D2D] text-sm font-black text-[#03030A]">
                  {i + 1}
                </span>
                <p className="mt-3 text-[14px] font-medium text-white/85">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.04]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-white/50">
                  <th className="px-4 py-3 font-medium">{l.tablePrize}</th>
                  <th className="px-4 py-3 font-medium">{l.tableOdds}</th>
                </tr>
              </thead>
              <tbody>
                {visiblePrizes.map((prize) => (
                  <tr key={prize.id ?? prize.key} className="border-t border-white/[0.05]">
                    <td className="px-4 py-3">
                      {prize.emoji} {displayPrizeName(prize, locale)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#FFB800]">
                      {getPrizeDisplayOdds(prize, drawWeight, locale === "zh" ? "zh" : "en")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-white/[0.08] px-4 py-3 text-[11px] text-white/40">
              {l.oddsNote}
            </p>
          </div>
        </div>
      </section>

      {/* ── 安全与信任 ── */}
      <section className="border-t border-white/[0.08] bg-white/[0.02] px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-[26px] font-black">{l.trustTitle}</h2>
          <div className="grid gap-3 sm:grid-cols-3 md:gap-6">
            {[
              { icon: "🔒", title: l.trustSecure, desc: l.trustSecureDesc },
              { icon: "🚚", title: l.trustShipping, desc: l.trustShippingDesc },
              { icon: "✅", title: l.trustAuthentic, desc: l.trustAuthenticDesc },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-white/[0.08] bg-white/[0.06] p-5 text-center"
              >
                <span className="text-3xl">{item.icon}</span>
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-[13px] text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-white/[0.08] px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-[26px] font-black">{l.faqTitle}</h2>
          <div className="mt-8 space-y-3">
            {l.faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-[20px] border border-white/[0.08] bg-white/[0.06] px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-[15px] font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 桌面端底部 CTA ── */}
      <section className="hidden border-t border-white/[0.08] py-16 md:block">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black">{l.ctaTitle}</h2>
          <p className="mt-3 text-white/60">
            {config.grandPrizeName} · {config.grandPrizeValue}
          </p>
          <a
            href="#draw"
            className="cta-breathe mt-8 inline-block rounded-full bg-gradient-to-br from-[#FFB800] via-[#FF7A00] to-[#FF2D2D] px-12 py-4 text-base font-bold text-[#03030A] shadow-[0_16px_40px_rgba(255,122,0,0.35)]"
          >
            {b.drawNow.replace("$60", `$${config.price}`)}
          </a>
        </div>
      </section>

      {products.length > 0 && (
        <section className="border-t border-white/[0.08] bg-[#050507] px-4 py-12 md:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/35">{l.betaLabel}</p>
              <h2 className="mt-1 text-lg font-semibold text-white/60">{l.alsoShop}</h2>
            </div>
            <Link href="/products" className="text-sm text-[#FFB800]/80 hover:text-[#FFB800]">
              {l.viewAll}
            </Link>
          </div>
          <p className="mx-auto mt-2 max-w-6xl text-[13px] text-white/35">{l.shopNote}</p>
        </section>
      )}
    </div>
  );
}
