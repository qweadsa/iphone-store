import type { BlindBoxPrize } from "@/types/blindbox";

/** 从奖品名称解析商城抵扣金额，如 "$50 Store Credit" → 50 */
export function parseCreditAmount(prizeName: string): number {
  const match = prizeName.replace(/,/g, "").match(/(?:RM|MYR|\$)?\s*([\d.]+)/i);
  if (match) return Math.round(parseFloat(match[1]) * 100) / 100;
  return 50;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "Player";
  const head = local.slice(0, 2);
  return `${head}***@${domain}`;
}

export function formatWinnerLine(
  prizeName: string,
  email?: string | null,
  locale: "zh" | "en" = "zh",
): string {
  const who = email ? maskEmail(email) : locale === "zh" ? "玩家" : "Player";
  return locale === "zh"
    ? `${who} 赢得 ${prizeName}`
    : `${who} won ${prizeName}`;
}

export type PrizeFulfillment =
  | { type: "credit"; amount: number }
  | { type: "coupon"; code: string; discount: string }
  | { type: "case" }
  | { type: "grand" }
  | { type: "retry" }
  | null;

/** 名称含 RM/MYR/$ 金额且无百分比的优惠券 → 进钱包抵扣 */
export function hasFixedMoneyCoupon(prizeName: string): boolean {
  if (/\d+\s*%/.test(prizeName)) return false;
  return /(?:RM|MYR|\$)\s*[\d,.]+/i.test(prizeName);
}

export function getPrizeFulfillment(prize: BlindBoxPrize): PrizeFulfillment {
  const kind = prize.fulfillmentType ?? prize.key;
  switch (kind) {
    case "credit":
      return { type: "credit", amount: parseCreditAmount(prize.name) };
    case "coupon": {
      if (hasFixedMoneyCoupon(prize.name)) {
        return { type: "credit", amount: parseCreditAmount(prize.name) };
      }
      const pct = prize.name.match(/(\d+)%/);
      return {
        type: "coupon",
        code: `BOX-${Date.now().toString(36).toUpperCase()}`,
        discount: pct ? `${pct[1]}%` : "20%",
      };
    }
    case "case":
      return { type: "case" };
    case "grand":
      return { type: "grand" };
    case "retry":
      return { type: "retry" };
    default:
      return null;
  }
}

export function needsShippingClaim(fulfillment: PrizeFulfillment): boolean {
  return fulfillment?.type === "grand" || fulfillment?.type === "case";
}

export function isWalletCreditPrize(fulfillment: PrizeFulfillment): boolean {
  return fulfillment?.type === "credit";
}
