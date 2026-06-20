import type { BlindBoxPrize } from "@/types/blindbox";
import { contentLang } from "@/lib/locale-resolve";

const RETRY_LABELS = {
  zh: "会员神秘券",
  en: "Member Reward",
  ms: "Ganjaran Ahli",
};

const COUPON_LABELS = {
  zh: "神秘优惠券",
  en: "Mystery Coupon",
  ms: "Kupon Misteri",
};

function fulfillmentOf(prize: Pick<BlindBoxPrize, "key" | "fulfillmentType">): string {
  return prize.fulfillmentType ?? prize.key;
}

/** 前台展示用奖品名：优先用后台填写的名称，留空时才用默认文案 */
export function displayPrizeName(
  prize: Pick<BlindBoxPrize, "key" | "name" | "fulfillmentType">,
  locale: string = "ms",
): string {
  const customName = prize.name?.trim();
  if (customName) return customName;

  const lang = contentLang(locale);
  const kind = fulfillmentOf(prize);
  if (kind === "retry") return RETRY_LABELS[lang];
  if (kind === "coupon") return COUPON_LABELS[lang];
  return prize.name;
}

export function isLowVisibilityPrize(prize: Pick<BlindBoxPrize, "key" | "fulfillmentType">): boolean {
  return fulfillmentOf(prize) === "retry";
}
