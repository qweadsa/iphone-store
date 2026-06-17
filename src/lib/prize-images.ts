import type { BlindBoxPrize } from "@/types/blindbox";

/** 后台未上传图片时的默认展示图（SVG，可被后台上传覆盖） */
const DEFAULT_BY_FULFILLMENT: Partial<Record<string, string>> = {
  grand: "/prizes/iphone-17-pro-max.svg",
  credit: "/prizes/store-credit.svg",
  case: "/prizes/gaming-pc.svg",
  coupon: "/prizes/coupon.svg",
  retry: "/prizes/member-reward.svg",
};

export function getPrizeImageUrl(
  prize: Pick<BlindBoxPrize, "key" | "imageUrl" | "name" | "fulfillmentType">,
): string | null {
  if (prize.imageUrl?.trim()) return prize.imageUrl.trim();
  const kind = prize.fulfillmentType ?? prize.key;
  return DEFAULT_BY_FULFILLMENT[kind] ?? null;
}