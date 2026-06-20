import type { BlindBoxPrize, FulfillmentType, ReelTier } from "@/types/blindbox";

export function mapDbPrize(r: {
  id: number;
  prizeType: string;
  name: string;
  subtitle?: string | null;
  tier?: string | null;
  fulfillmentType?: string | null;
  weight: number;
  displayOdds?: string | null;
  emoji: string;
  imageUrl?: string | null;
  drawable?: boolean | null;
  showInPool?: boolean | null;
  active?: boolean | null;
  sortOrder?: number | null;
}): BlindBoxPrize {
  const tier = (r.tier ?? "rare") as ReelTier;
  const fulfillmentType = resolveFulfillmentType(r.fulfillmentType, r.prizeType);
  return {
    id: r.id,
    key: r.prizeType,
    name: r.name,
    subtitle: r.subtitle,
    tier,
    fulfillmentType,
    weight: r.weight,
    displayOdds: r.displayOdds ?? null,
    emoji: r.emoji,
    imageUrl: r.imageUrl,
    drawable: r.drawable ?? true,
    showInPool: r.showInPool ?? true,
    active: r.active ?? true,
    sortOrder: r.sortOrder ?? 0,
  };
}

/** DB 发奖类型 + 标识 → 前台/抽奖实际使用的类型 */
export function resolveFulfillmentType(
  fulfillmentType: string | null | undefined,
  prizeType: string,
): FulfillmentType {
  const ft = fulfillmentType?.trim();
  // 明确选「仅展示」时保留 none，不因标识 retry 被推断成安慰奖
  if (ft === "none") return "none";
  if (ft) return ft as FulfillmentType;
  return inferFulfillment(prizeType);
}

/** 首页奖池 + 开箱滚轴是否展示（含安慰奖，由后台 showInPool 控制） */
export function willShowPrizeInPool(prize: {
  active?: boolean | null;
  showInPool?: boolean | null;
}): boolean {
  return prize.active !== false && prize.showInPool !== false;
}

function inferFulfillment(prizeType: string): FulfillmentType {
  if (prizeType === "grand") return "grand";
  if (prizeType === "credit") return "credit";
  if (prizeType === "case") return "case";
  if (prizeType === "coupon") return "coupon";
  if (prizeType === "retry") return "retry";
  return "none";
}

export function isDrawablePrize(prize: Pick<BlindBoxPrize, "active" | "drawable" | "weight">): boolean {
  return prize.active !== false && prize.drawable !== false && prize.weight > 0;
}

export function isPoolVisiblePrize(
  prize: Pick<BlindBoxPrize, "active" | "showInPool">,
): boolean {
  return willShowPrizeInPool(prize);
}

export function isReelVisiblePrize(
  prize: Pick<BlindBoxPrize, "active" | "showInPool">,
): boolean {
  return willShowPrizeInPool(prize);
}

export function isGrandPrize(
  prize: Pick<BlindBoxPrize, "tier" | "fulfillmentType">,
): boolean {
  return prize.tier === "legendary" || prize.fulfillmentType === "grand";
}
