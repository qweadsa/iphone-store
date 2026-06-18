import type { BlindBoxPrize } from "@/types/blindbox";

/** 后台未上传图片时的默认展示图（SVG，可被后台上传覆盖） */
const DEFAULT_BY_KEY: Record<string, string> = {
  "iphone-17-pro-max": "/prizes/iphone-17-pro-max.svg",
  grand: "/prizes/iphone-17-pro-max.svg",
  "macbook-pro-16": "/prizes/macbook-pro.svg",
  "macbook-pro": "/prizes/macbook-pro.svg",
  "rtx-4090": "/prizes/rtx-4090.svg",
  "sony-a7iv": "/prizes/sony-camera.svg",
  "rog-gaming-pc": "/prizes/gaming-pc.svg",
  "airpods-max": "/prizes/airpods-max.svg",
  "ipad-pro-m4": "/prizes/ipad-pro.svg",
  "oled-monitor": "/prizes/oled-monitor.svg",
  "nvme-ssd": "/prizes/nvme-ssd.svg",
  "mechanical-keyboard": "/prizes/keyboard.svg",
  "store-credit-50": "/prizes/store-credit.svg",
  credit: "/prizes/store-credit.svg",
  "coupon-20": "/prizes/coupon.svg",
  coupon: "/prizes/coupon.svg",
  case: "/prizes/gaming-pc.svg",
  retry: "/prizes/member-reward.svg",
};

const DEFAULT_BY_FULFILLMENT: Partial<Record<string, string>> = {
  grand: "/prizes/iphone-17-pro-max.svg",
  credit: "/prizes/store-credit.svg",
  case: "/prizes/gaming-pc.svg",
  coupon: "/prizes/coupon.svg",
  retry: "/prizes/member-reward.svg",
};

function matchKeyFromName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes("iphone")) return "iphone-17-pro-max";
  if (lower.includes("macbook")) return "macbook-pro";
  if (lower.includes("rtx") || lower.includes("4090")) return "rtx-4090";
  if (lower.includes("sony") || lower.includes("a7")) return "sony-a7iv";
  if (lower.includes("airpods")) return "airpods-max";
  if (lower.includes("ipad")) return "ipad-pro-m4";
  if (lower.includes("monitor") || lower.includes("oled")) return "oled-monitor";
  if (lower.includes("ssd") || lower.includes("nvme")) return "nvme-ssd";
  if (lower.includes("keyboard")) return "mechanical-keyboard";
  if (lower.includes("gaming") || lower.includes("pc")) return "rog-gaming-pc";
  return null;
}

export function getPrizeImageUrl(
  prize: Pick<BlindBoxPrize, "key" | "imageUrl" | "name" | "fulfillmentType">,
): string | null {
  if (prize.imageUrl?.trim()) return prize.imageUrl.trim();
  if (prize.key && DEFAULT_BY_KEY[prize.key]) return DEFAULT_BY_KEY[prize.key];
  const nameKey = prize.name ? matchKeyFromName(prize.name) : null;
  if (nameKey && DEFAULT_BY_KEY[nameKey]) return DEFAULT_BY_KEY[nameKey];
  const kind = prize.fulfillmentType ?? prize.key;
  return DEFAULT_BY_FULFILLMENT[kind] ?? null;
}
