export const PRODUCT_CATEGORIES = [
  { key: "phone", labelZh: "手机", labelEn: "Phones", icon: "📱" },
  { key: "computer", labelZh: "电脑", labelEn: "Computers", icon: "💻" },
  { key: "camera", labelZh: "相机", labelEn: "Cameras", icon: "📷" },
  { key: "audio", labelZh: "音频", labelEn: "Audio", icon: "🎧" },
  { key: "watch", labelZh: "手表", labelEn: "Watches", icon: "⌚" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["key"];

export const CATEGORY_KEYS = PRODUCT_CATEGORIES.map((c) => c.key);

import { toTraditional } from "@/lib/zh-hant";

export function getCategoryLabel(
  key: string,
  locale: "zh" | "en" = "zh",
): string {
  const cat = PRODUCT_CATEGORIES.find((c) => c.key === key);
  if (!cat) return key;
  return locale === "zh" ? toTraditional(cat.labelZh) : cat.labelEn;
}

export function isValidCategory(key: string): key is ProductCategory {
  return CATEGORY_KEYS.includes(key as ProductCategory);
}

/** 兼容旧分类数据 */
export function normalizeCategory(category: string): ProductCategory {
  const legacy: Record<string, ProductCategory> = {
    pro: "phone",
    standard: "phone",
    se: "phone",
  };
  if (isValidCategory(category)) return category;
  return legacy[category] ?? "phone";
}
