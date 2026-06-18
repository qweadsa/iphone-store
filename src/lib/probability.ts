export function calcProbability(weight: number, total: number): string {
  if (total === 0) return "0%";
  return `${((weight / total) * 100).toFixed(weight < 1 ? 2 : 1)}%`;
}

/** 前台奖池展示用概率（与真实抽奖权重无关） */
export function getPrizeDisplayOdds(
  prize: {
    displayOdds?: string | null;
    weight: number;
    drawable?: boolean;
  },
  drawWeight: number,
  locale: "zh" | "en" = "zh",
): string {
  const custom = prize.displayOdds?.trim();
  if (custom) return custom;

  if (prize.drawable !== false && prize.weight > 0 && drawWeight > 0) {
    return calcProbability(prize.weight, drawWeight);
  }

  return locale === "zh" ? "展示" : "Display";
}

/** 后台真实抽奖概率（仅按权重计算） */
export function getPrizeRealOdds(
  prize: { weight: number; drawable?: boolean },
  drawWeight: number,
): string {
  if (prize.drawable === false || prize.weight <= 0 || drawWeight <= 0) return "—";
  return calcProbability(prize.weight, drawWeight);
}
