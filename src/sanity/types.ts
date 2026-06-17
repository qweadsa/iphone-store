import type { Product } from "@/types/product";

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
};

export type SanityProduct = {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: Product["category"];
  badge?: Product["badge"];
  image?: SanityImage;
  storageOptions: { size: string; price: number }[];
  colors: { name: string; hex: string }[];
  features: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export type SanityBlindBoxPrize = {
  _id: string;
  name: string;
  prizeType: "grand" | "credit" | "case" | "coupon" | "retry";
  weight: number;
  emoji?: string;
  image?: SanityImage;
};

export type SanityBlindBoxConfig = {
  price: number;
  enabled: boolean;
  grandPrizeName: string;
  grandPrizeValue: string;
  heroTitle?: string;
  heroSubtitle?: string;
  grandPrizeImage?: SanityImage;
  seoTitle?: string;
  seoDescription?: string;
  dailyLimit?: number;
};

export type SanitySiteSettings = {
  siteName?: string;
  homeSeoTitle?: string;
  homeSeoDescription?: string;
  ogImage?: SanityImage;
  supportPhone?: string;
  supportEmail?: string;
};

export type BlindBoxPrize = {
  key: SanityBlindBoxPrize["prizeType"];
  name: string;
  weight: number;
  emoji: string;
  imageUrl?: string | null;
};
