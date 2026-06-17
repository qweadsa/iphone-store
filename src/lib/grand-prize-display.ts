import { isGrandPrize, isPoolVisiblePrize } from "@/lib/blindbox-prize-utils";
import { getPrizeImageUrl } from "@/lib/prize-images";
import { displayPrizeName } from "@/lib/prize-display";
import type { BlindBoxPrize } from "@/types/blindbox";

export type GrandPrizeDisplay = {
  name: string;
  value: string;
  imageUrl: string | null;
  emoji: string;
  prizeKey: string | null;
};

export function resolveGrandPrizeDisplay(
  config: {
    grandPrizeName: string;
    grandPrizeValue: string;
    grandPrizeImageUrl?: string | null;
  },
  prizes: BlindBoxPrize[],
): GrandPrizeDisplay {
  const grand =
    prizes.find((p) => isGrandPrize(p) && isPoolVisiblePrize(p)) ??
    prizes.find((p) => p.tier === "legendary" && isPoolVisiblePrize(p));

  const imageUrl =
    config.grandPrizeImageUrl?.trim() ||
    (grand ? getPrizeImageUrl(grand) : null);

  return {
    name: config.grandPrizeName?.trim() || grand?.name || "Grand Prize",
    value: config.grandPrizeValue,
    imageUrl,
    emoji: grand?.emoji ?? "🏆",
    prizeKey: grand?.key ?? null,
  };
}

export function buildPoolHighlightChips(
  prizes: BlindBoxPrize[],
  locale: string,
  grandPrizeKey: string | null,
) {
  const visible = prizes
    .filter(isPoolVisiblePrize)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const highlights = visible.filter((p) => p.key !== grandPrizeKey).slice(0, 3);

  const positions = [
    "top-2 right-2",
    "top-[18%] -right-2",
    "bottom-4 right-2",
  ] as const;

  return highlights.map((prize, index) => ({
    label: displayPrizeName(prize, locale),
    emoji: prize.emoji,
    className: positions[index] ?? "bottom-3 right-2",
  }));
}
