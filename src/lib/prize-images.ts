import type { BlindBoxPrize } from "@/types/blindbox";

/** 后台未上传图片时的默认展示图（SVG，可被后台上传覆盖） */
const DEFAULT_BY_KEY: Record<string, string> = {
  "iphone-17-pro-max": "/prizes/iphone-17-pro-max.svg",
  "macbook-pro-16": "/prizes/macbook-pro.svg",
  "rtx-4090": "/prizes/rtx-4090.svg",
  "sony-a7iv": "/prizes/sony-camera.svg",
  "rog-gaming-pc": "/prizes/gaming-pc.svg",
  "airpods-max": "/prizes/airpods-max.svg",
  "ipad-pro-m4": "/prizes/ipad-pro.svg",
  "oled-monitor": "/prizes/oled-monitor.svg",
  "nvme-ssd": "/prizes/nvme-ssd.svg",
  "mechanical-keyboard": "/prizes/keyboard.svg",
  "store-credit-50": "/prizes/store-credit.svg",
  "coupon-20": "/prizes/coupon.svg",
  retry: "/prizes/member-reward.svg",
};

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
  if (prize.key && DEFAULT_BY_KEY[prize.key]) return DEFAULT_BY_KEY[prize.key];
  const kind = prize.fulfillmentType ?? prize.key;
  return DEFAULT_BY_FULFILLMENT[kind] ?? null;
}