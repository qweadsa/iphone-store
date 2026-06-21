export const locales = ["ms", "en", "zh", "ja", "ko"] as const;

export type Locale = (typeof locales)[number];

/** 马来西亚站默认马来语 */
export const defaultLocale: Locale = "ms";

export const localeLabels: Record<Locale, string> = {
  ms: "Bahasa Melayu",
  en: "English (US)",
  zh: "简体中文",
  ja: "日本語",
  ko: "한국어",
};

export const localeFlags: Record<Locale, string> = {
  ms: "🇲🇾",
  en: "🇺🇸",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
};
