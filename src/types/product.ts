export type StorageOption = {
  size: string;
  price: number;
};

export type ColorOption = {
  name: string;
  hex: string;
};

import type { ProductCategory } from "@/lib/categories";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image?: string;
  badge?: "new" | "hot" | "value";
  category: ProductCategory;
  storageOptions: StorageOption[];
  colors: ColorOption[];
  features: string[];
};

export type CartItem = {
  productId: string;
  name: string;
  color: string;
  colorHex?: string;
  storage: string;
  price: number;
  quantity: number;
};
