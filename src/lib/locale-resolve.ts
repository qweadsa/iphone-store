import {
  MARKET_CURRENCY_SYMBOL,
  normalizeGrandPrizeValue,
  normalizeMarketText,
} from "@/lib/market";

export type ContentLang = "zh" | "en" | "ms";

export function contentLang(locale: string): ContentLang {
  if (locale === "zh") return "zh";
  if (locale === "ms") return "ms";
  if (locale === "ja") return "en";
  if (locale === "ko") return "en";
  return "en";
}

export function htmlLang(locale: string): string {
  if (locale === "zh") return "zh-CN";
  if (locale === "ms") return "ms-MY";
  if (locale === "ja") return "ja-JP";
  if (locale === "ko") return "ko-KR";
  return "en-MY";
}

function priceLocaleTag(locale: string): string {
  if (locale === "zh") return "zh-CN";
  if (locale === "ms") return "ms-MY";
  if (locale === "ja") return "ja-JP";
  if (locale === "ko") return "ko-KR";
  return "en-MY";
}

/** 全站统一显示 market.config 中的货币符号（马来西亚用 RM，不用 ISO 代码 MYR） */
export function formatMarketPrice(price: number, locale: string): string {
  const amount = new Intl.NumberFormat(priceLocaleTag(locale), {
    maximumFractionDigits: 0,
  }).format(price);
  return `${MARKET_CURRENCY_SYMBOL}${amount}`;
}

export { normalizeGrandPrizeValue, normalizeMarketText };

/** 替换文案里的占位价格（RM59 / $60 等 → 当前配置价 + 市场货币格式） */
export function injectConfigPrice(text: string, price: number, locale: string): string {
  const formatted = formatMarketPrice(price, locale);
  return normalizeMarketText(text)
    .replace(/RM[\d,]+/g, formatted)
    .replace(/MYR\s*[\d,]+/gi, formatted)
    .replace(/\$[\d,]+/g, formatted);
}
