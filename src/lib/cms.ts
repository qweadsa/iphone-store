import {
  products as fallbackProducts,
  BLIND_BOX_PRICE,
  getProductById as getLocalProduct,
} from "./products";
import { isDatabaseConfigured, prisma } from "./prisma";
import { mapDbPrize } from "@/lib/blindbox-prize-utils";
import type { BlindBoxPrize } from "@/types/blindbox";
import { normalizeCategory } from "@/lib/categories";
import { normalizeBlindBoxConfig } from "@/lib/market";
import { parseDemoWinners } from "@/lib/demo-winners";
import { parseHeroShowcaseJson, type HeroShowcaseEntry } from "@/lib/hero-showcase";
import { getProductImageUrl } from "@/lib/product-images";
import type { Product } from "@/types/product";

const DEFAULT_PRIZES: BlindBoxPrize[] = [
  { key: "grand", name: "iPhone 17 Pro Max", weight: 1, emoji: "📱" },
  { key: "credit", name: "Kredit Kedai RM50", weight: 10, emoji: "💰" },
  { key: "case", name: "Premium Phone Case", weight: 20, emoji: "📦" },
  { key: "coupon", name: "20% Off Coupon", weight: 25, emoji: "🎟️" },
  { key: "retry", name: "Better Luck Next Time", weight: 944, emoji: "🍀" },
];

const DEFAULT_BLIND_BOX_CONFIG = {
  price: BLIND_BOX_PRICE,
  enabled: true,
  grandPrizeName: "iPhone 17 Pro Max",
  grandPrizeValue: "RM5,999",
  heroTitle: "Menangi iPhone 17 Pro Max",
  heroSubtitle:
    "Hanya RM59 untuk satu peluang hadiah utama! Setiap kotak penuh kejutan.",
  seoTitle: "Kotak Misteri iPhone — Menangi iPhone 17 Pro Max RM59",
  seoDescription:
    "Cuba Kotak Misteri iPhone RM59. Menangi iPhone 17 Pro Max bernilai RM5,999. Acara terhad, penghantaran percuma di Malaysia.",
};

type ProductExtra = Product & {
  imageUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
};

function mapDbProduct(p: {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  badge: string | null;
  imageUrl: string | null;
  storageOptions: unknown;
  colors: unknown;
  features: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
}): ProductExtra {
  return {
    id: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    category: normalizeCategory(p.category),
    badge: (p.badge as Product["badge"]) ?? undefined,
    image: p.imageUrl ?? getProductImageUrl(p.slug) ?? "",
    imageUrl: p.imageUrl,
    storageOptions: p.storageOptions as Product["storageOptions"],
    colors: p.colors as Product["colors"],
    features: p.features as string[],
    seoTitle: p.seoTitle ?? undefined,
    seoDescription: p.seoDescription ?? undefined,
  };
}

function isPhoneCategory(category: string): boolean {
  return normalizeCategory(category) === "phone";
}

function filterPhoneProducts(items: ProductExtra[]): ProductExtra[] {
  return items.filter((p) => isPhoneCategory(p.category));
}

export async function getProducts(): Promise<ProductExtra[]> {
  if (isDatabaseConfigured) {
    try {
      const rows = await prisma.product.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      });
      return filterPhoneProducts(rows.map(mapDbProduct));
    } catch (err) {
      console.error("[cms] getProducts DB error:", err);
    }
  }
  return filterPhoneProducts(fallbackProducts.map((p) => ({ ...p, imageUrl: null })));
}

export async function getProductBySlug(slug: string) {
  if (isDatabaseConfigured) {
    try {
      const row = await prisma.product.findFirst({
        where: { slug, active: true },
      });
      if (row) {
        const product = mapDbProduct(row);
        if (!isPhoneCategory(product.category)) return undefined;
        return product;
      }
      // 数据库已连接且未找到：不再回退静态数据，避免 Navicat 新产品与旧数据混淆
      return undefined;
    } catch (err) {
      console.error("[cms] getProductBySlug DB error:", err);
    }
  }
  const p = getLocalProduct(slug);
  return p && isPhoneCategory(p.category) ? { ...p, imageUrl: null as string | null } : undefined;
}

export async function getBlindBoxPrizes(): Promise<BlindBoxPrize[]> {
  if (!isDatabaseConfigured) {
    return DEFAULT_PRIZES;
  }
  try {
    const rows = await prisma.blindBoxPrize.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(mapDbPrize);
  } catch (err) {
    console.error("[cms] getBlindBoxPrizes DB error:", err);
    return [];
  }
}

export async function getBlindBoxConfig() {
  if (isDatabaseConfigured) {
    try {
      const r = await prisma.blindBoxConfig.findFirst({ where: { id: 1 } });
      if (r) {
        return {
          ...normalizeBlindBoxConfig({
            price: r.price,
            enabled: r.enabled,
            grandPrizeName: r.grandPrizeName,
            grandPrizeValue: r.grandPrizeValue,
            heroTitle: r.heroTitle ?? undefined,
            heroSubtitle: r.heroSubtitle ?? undefined,
            seoTitle: r.seoTitle ?? DEFAULT_BLIND_BOX_CONFIG.seoTitle,
            seoDescription: r.seoDescription ?? DEFAULT_BLIND_BOX_CONFIG.seoDescription,
            dailyLimit: r.dailyLimit,
            winnersDemoMode: r.winnersDemoMode ?? true,
            grandPrizeImageUrl: r.grandPrizeImageUrl,
            heroShowcase: parseHeroShowcaseJson(r.heroShowcaseJson),
          }),
          statsDemoMode: r.statsDemoMode ?? true,
          displayPlayersToday: r.displayPlayersToday ?? 128,
          displayWinnersToday: r.displayWinnersToday ?? 42,
          demoWinners: parseDemoWinners(r.demoWinnersJson),
        };
      }
    } catch {
      /* fall through */
    }
  }
  return {
    ...DEFAULT_BLIND_BOX_CONFIG,
    grandPrizeImageUrl: null as string | null,
    heroShowcase: [] as HeroShowcaseEntry[],
    winnersDemoMode: false,
    demoWinners: parseDemoWinners(null),
  };
}

export async function getSiteSettings() {
  if (!isDatabaseConfigured) return null;
  try {
    const r = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    if (!r) return null;
    return {
      homeSeoTitle: r.homeSeoTitle ?? undefined,
      homeSeoDescription: r.homeSeoDescription ?? undefined,
    };
  } catch {
    return null;
  }
}
