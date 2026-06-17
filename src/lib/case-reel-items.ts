import type { BlindBoxPrize } from "@/types/blindbox";
import { displayPrizeName } from "@/lib/prize-display";
import { getPrizeImageUrl } from "@/lib/prize-images";
import { isReelVisiblePrize } from "@/lib/blindbox-prize-utils";

export type ReelTier = "legendary" | "epic" | "rare" | "uncommon";

export type ReelItem = {
  id: string;
  name: string;
  subtitle: string;
  tier: ReelTier;
  emoji: string;
  imageUrl?: string | null;
  prizeKey?: string;
};

export const REEL_TIER_STYLES: Record<
  ReelTier,
  { border: string; glow: string; label: string }
> = {
  legendary: {
    border: "border-[#FFB800]/70",
    glow: "shadow-[0_0_24px_rgba(255,184,0,0.35)]",
    label: "text-[#FFB800]",
  },
  epic: {
    border: "border-[#A855F7]/60",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.28)]",
    label: "text-[#C084FC]",
  },
  rare: {
    border: "border-[#3B82F6]/55",
    glow: "shadow-[0_0_16px_rgba(59,130,246,0.22)]",
    label: "text-[#60A5FA]",
  },
  uncommon: {
    border: "border-white/20",
    glow: "",
    label: "text-white/55",
  },
};

export function prizeToReelItem(
  prize: BlindBoxPrize,
  locale: string,
  spinId?: number,
): ReelItem {
  const id = prize.id != null ? `prize-${prize.id}` : `prize-${prize.key}`;
  return {
    id: spinId != null ? `${id}-${spinId}` : id,
    name: displayPrizeName(prize, locale),
    subtitle: prize.subtitle?.trim() || "Premium Tech Prize",
    tier: prize.tier ?? "rare",
    emoji: prize.emoji || "🎁",
    imageUrl: getPrizeImageUrl(prize),
    prizeKey: prize.key,
  };
}

/** 构建滚轴奖池：完全来自后台奖品配置 */
export function buildReelPool(prizes: BlindBoxPrize[], locale: string): ReelItem[] {
  return prizes
    .filter(isReelVisiblePrize)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((p, i) => prizeToReelItem(p, locale, i));
}

const FALLBACK_ITEM: ReelItem = {
  id: "fallback",
  name: "Mystery Reward",
  subtitle: "Tech Prize",
  tier: "uncommon",
  emoji: "🎁",
};

export function pickRandomReelItem(pool: ReelItem[]): ReelItem {
  if (pool.length === 0) return FALLBACK_ITEM;
  return pool[Math.floor(Math.random() * pool.length)] ?? FALLBACK_ITEM;
}

/** 生成 CS:GO 式滚轴序列，winner 落在指定索引 */
export function buildSpinSequence(
  pool: ReelItem[],
  winner: ReelItem,
  total: number,
  winnerIndex: number,
): ReelItem[] {
  const seq: ReelItem[] = [];
  for (let i = 0; i < total; i++) {
    if (i === winnerIndex) {
      seq.push({ ...winner, id: `${winner.id}-win-${i}` });
    } else {
      const rand = pickRandomReelItem(pool);
      seq.push({ ...rand, id: `${rand.id}-${i}` });
    }
  }
  return seq;
}

export const REEL_ITEM_WIDTH = 148;
export const REEL_ITEM_GAP = 10;
export const REEL_ITEM_STEP = REEL_ITEM_WIDTH + REEL_ITEM_GAP;
export const REEL_WINNER_INDEX = 38;
export const REEL_SPIN_COUNT = 45;
