import marketConfig from "../../market.config.json";

export type MarketConfig = typeof marketConfig;

/** 全站货币与市场配置 — 前台、后台、API 均从此读取 */
export const market = marketConfig;
export const MARKET_CURRENCY = market.currency;
export const MARKET_CURRENCY_SYMBOL = market.currencySymbol;

export const DEFAULT_BLIND_BOX_PRICE = 59;
export const DEFAULT_GRAND_PRIZE_VALUE = `${MARKET_CURRENCY_SYMBOL}5,999`;

export const RECHARGE_MIN = market.rechargeMin ?? 20;
export const RECHARGE_MAX = market.rechargeMax ?? 40000;
export const RECHARGE_QUICK_AMOUNTS = market.rechargeQuickAmounts ?? [20, 50, 100, 200];

const LEGACY_USD_REPLACEMENTS: [RegExp, string][] = [
  [/\$1,?199(?:\.00)?/g, DEFAULT_GRAND_PRIZE_VALUE],
  [/\$60\b/g, `${MARKET_CURRENCY_SYMBOL}59`],
  [/\$50\b/g, `${MARKET_CURRENCY_SYMBOL}50`],
  [/\bUSD\b/gi, MARKET_CURRENCY],
];

/** 将旧美元文案转为当前市场货币（MY 站） */
export function normalizeMarketText(text: string | null | undefined): string {
  if (!text?.trim()) return text?.trim() ?? "";
  let result = text;
  for (const [pattern, replacement] of LEGACY_USD_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function normalizeGrandPrizeValue(value: string | null | undefined): string {
  const v = value?.trim();
  if (!v) return DEFAULT_GRAND_PRIZE_VALUE;
  return normalizeMarketText(v) || DEFAULT_GRAND_PRIZE_VALUE;
}

/** 旧库可能存了 US 默认价 60 */
export function normalizeBlindBoxPrice(price: number | null | undefined): number {
  if (price == null || Number.isNaN(price)) return DEFAULT_BLIND_BOX_PRICE;
  if (price === 60) return DEFAULT_BLIND_BOX_PRICE;
  return price;
}

export type BlindBoxConfigFields = {
  price?: number | null;
  grandPrizeValue?: string | null;
  heroSubtitle?: string | null;
  heroTitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function normalizeBlindBoxConfig<T extends BlindBoxConfigFields>(config: T): T {
  return {
    ...config,
    price: normalizeBlindBoxPrice(config.price ?? DEFAULT_BLIND_BOX_PRICE),
    grandPrizeValue: normalizeGrandPrizeValue(config.grandPrizeValue),
    heroSubtitle:
      config.heroSubtitle != null ? normalizeMarketText(config.heroSubtitle) : config.heroSubtitle,
    heroTitle: config.heroTitle != null ? normalizeMarketText(config.heroTitle) : config.heroTitle,
    seoTitle: config.seoTitle != null ? normalizeMarketText(config.seoTitle) : config.seoTitle,
    seoDescription:
      config.seoDescription != null
        ? normalizeMarketText(config.seoDescription)
        : config.seoDescription,
  };
}

export function blindBoxConfigNeedsCurrencyMigration(
  before: BlindBoxConfigFields,
  after: BlindBoxConfigFields,
): boolean {
  return (
    before.price !== after.price ||
    before.grandPrizeValue !== after.grandPrizeValue ||
    before.heroSubtitle !== after.heroSubtitle ||
    before.heroTitle !== after.heroTitle ||
    before.seoTitle !== after.seoTitle ||
    before.seoDescription !== after.seoDescription
  );
}

/** 后台展示用：RM59 */
export function formatAdminPrice(price: number): string {
  return `${MARKET_CURRENCY_SYMBOL}${price}`;
}

export const DEFAULT_HERO_SUBTITLE = `Just ${MARKET_CURRENCY_SYMBOL}59 for one chance at the grand prize! Every box is a surprise.`;
