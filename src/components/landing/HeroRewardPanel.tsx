"use client";

import HeroGrandPrizeCard from "@/components/landing/HeroGrandPrizeCard";
import LiveWinnerFeed, { type LiveWinnerItem } from "@/components/landing/LiveWinnerFeed";
import type { GrandPrizeStatus } from "@/lib/blindbox-public";

type StatCard = {
  n: string;
  label: string;
  isText?: boolean;
};

type Props = {
  grandPrizeName: string;
  grandPrizeValue: string;
  grandPrizeStatus: GrandPrizeStatus;
  grandStatusLabel: string;
  statsCards: StatCard[];
  winnerItems: LiveWinnerItem[];
  floatingChips: { label: string; emoji: string; className: string }[];
  showStats?: boolean;
  statsDesktopOnly?: boolean;
  labels: {
    grandEyebrow: string;
    grandSubtitle: string;
    winBadge: string;
    winnersTitle: string;
    winnersSubtitle: string;
    winnersEmpty: string;
  };
};

export default function HeroRewardPanel({
  grandPrizeName,
  grandPrizeValue,
  grandPrizeStatus,
  grandStatusLabel,
  statsCards,
  winnerItems,
  floatingChips,
  showStats = true,
  statsDesktopOnly = false,
  labels,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 lg:gap-4">
      <HeroGrandPrizeCard
        name={grandPrizeName}
        value={grandPrizeValue}
        status={grandPrizeStatus}
        statusLabel={grandStatusLabel}
        floatingChips={floatingChips}
        labels={{
          eyebrow: labels.grandEyebrow,
          subtitle: labels.grandSubtitle,
          winBadge: labels.winBadge,
        }}
      />

      {showStats && (
        <div
          className={`grid grid-cols-3 gap-2.5 sm:gap-3 ${statsDesktopOnly ? "hidden lg:grid" : ""}`}
        >
          {statsCards.map((stat) => (
            <div
              key={stat.label}
              className="flex h-[72px] flex-col items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.07] px-1.5 text-center"
            >
              <p
                className={`font-bold leading-none ${
                  stat.isText ? "text-[12px] text-[#FFB800] sm:text-[13px]" : "text-[18px] text-[#FFB800] sm:text-[20px]"
                }`}
              >
                {stat.n}
              </p>
              <p className="mt-1.5 text-[10px] text-white/50 sm:text-[11px]">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <LiveWinnerFeed
        title={labels.winnersTitle}
        subtitle={labels.winnersSubtitle}
        emptyText={labels.winnersEmpty}
        items={winnerItems}
      />
    </div>
  );
}
