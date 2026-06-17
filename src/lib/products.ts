import type { Product } from "@/types/product";



export const BLIND_BOX_PRICE = 59;

export const BLIND_BOX_PRODUCT_ID = "iphone-17-pro-max";



export const products: Product[] = [

  {

    id: "iphone-17-pro-max",

    name: "iPhone 17 Pro Max",

    tagline: "The most powerful iPhone ever.",

    description:

      "6.9-inch Super Retina XDR display, A19 Pro chip, 48MP Fusion camera system, titanium design, Apple Intelligence.",

    image: "/products/iphone-17-pro-max.png",

    badge: "new",

    category: "phone",

    storageOptions: [

      { size: "256GB", price: 1199 },

      { size: "512GB", price: 1399 },

      { size: "1TB", price: 1599 },

    ],

    colors: [

      { name: "Black Titanium", hex: "#3C3C3D" },

      { name: "White Titanium", hex: "#F2F1ED" },

      { name: "Natural Titanium", hex: "#BFA48F" },

      { name: "Desert Titanium", hex: "#C4A882" },

    ],

    features: [

      "A19 Pro chip",

      "6.9-inch display",

      "Up to 33 hrs video playback",

      "5x optical zoom",

    ],

  },

  {

    id: "iphone-17-pro",

    name: "iPhone 17 Pro",

    tagline: "Pro power. Pocket size.",

    description:

      "6.3-inch Super Retina XDR display, A19 Pro chip, pro camera system, Action button, titanium body.",

    image: "/products/iphone-17-pro.png",

    badge: "new",

    category: "phone",

    storageOptions: [

      { size: "128GB", price: 999 },

      { size: "256GB", price: 1099 },

      { size: "512GB", price: 1299 },

      { size: "1TB", price: 1499 },

    ],

    colors: [

      { name: "Black Titanium", hex: "#3C3C3D" },

      { name: "White Titanium", hex: "#F2F1ED" },

      { name: "Natural Titanium", hex: "#BFA48F" },

      { name: "Desert Titanium", hex: "#C4A882" },

    ],

    features: ["A19 Pro chip", "6.3-inch display", "Pro camera", "Titanium design"],

  },

  {

    id: "iphone-17",

    name: "iPhone 17",

    tagline: "Camera Control. In your hand.",

    description:

      "6.1-inch Super Retina XDR display, A19 chip, new Camera Control button, 48MP Fusion camera.",

    image: "/products/iphone-17.png",

    badge: "hot",

    category: "phone",

    storageOptions: [

      { size: "128GB", price: 799 },

      { size: "256GB", price: 899 },

      { size: "512GB", price: 1099 },

    ],

    colors: [

      { name: "Ultramarine", hex: "#4A6FA5" },

      { name: "Teal", hex: "#3D5C5C" },

      { name: "Pink", hex: "#F2C4C4" },

      { name: "White", hex: "#F5F5F0" },

      { name: "Black", hex: "#1D1D1F" },

    ],

    features: ["A19 chip", "Camera Control", "6.1-inch display", "Action button"],

  },

  {

    id: "iphone-17-plus",

    name: "iPhone 17 Plus",

    tagline: "Big screen. Big battery.",

    description:

      "6.7-inch Super Retina XDR display, A19 chip, larger battery for all-day power.",

    image: "/products/iphone-17-plus.png",

    category: "phone",

    storageOptions: [

      { size: "128GB", price: 899 },

      { size: "256GB", price: 999 },

      { size: "512GB", price: 1199 },

    ],

    colors: [

      { name: "Ultramarine", hex: "#4A6FA5" },

      { name: "Teal", hex: "#3D5C5C" },

      { name: "Pink", hex: "#F2C4C4" },

      { name: "White", hex: "#F5F5F0" },

      { name: "Black", hex: "#1D1D1F" },

    ],

    features: ["A19 chip", "6.7-inch display", "All-day battery", "Camera Control"],

  },

  {

    id: "iphone-15",

    name: "iPhone 15",

    tagline: "Dynamic Island. Classic choice.",

    description:

      "6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP main camera, USB-C, Dynamic Island.",

    image: "",

    badge: "value",

    category: "phone",

    storageOptions: [

      { size: "128GB", price: 699 },

      { size: "256GB", price: 799 },

      { size: "512GB", price: 999 },

    ],

    colors: [

      { name: "Pink", hex: "#FAD7E6" },

      { name: "Yellow", hex: "#F9E076" },

      { name: "Green", hex: "#C8D5B9" },

      { name: "Blue", hex: "#A7C7E7" },

      { name: "Black", hex: "#1D1D1F" },

    ],

    features: ["A16 Bionic", "Dynamic Island", "48MP camera", "USB-C"],

  },

  {

    id: "iphone-se",

    name: "iPhone SE",

    tagline: "Serious power. Serious value.",

    description:

      "4.7-inch Retina display, A15 Bionic chip, classic Home button, 5G, compact and portable.",

    image: "",

    category: "phone",

    storageOptions: [

      { size: "64GB", price: 429 },

      { size: "128GB", price: 479 },

      { size: "256GB", price: 579 },

    ],

    colors: [

      { name: "Midnight", hex: "#1D1D1F" },

      { name: "Starlight", hex: "#F5F5F0" },

      { name: "Red", hex: "#BF0013" },

    ],

    features: ["A15 Bionic", "5G", "Touch ID", "Compact size"],

  },

];



export function getProductById(id: string): Product | undefined {

  return products.find((p) => p.id === id);

}



import { MARKET_CURRENCY } from "@/lib/market";

export function formatPrice(price: number, locale = "ms-MY"): string {
  const tag = locale.startsWith("zh")
    ? "zh-CN"
    : locale.startsWith("ja")
      ? "ja-JP"
      : locale.startsWith("ko")
        ? "ko-KR"
        : locale.startsWith("ms")
          ? "ms-MY"
          : "en-MY";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: MARKET_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}



export function getProductColorHex(product: Product, colorName?: string): string {

  const color = product.colors.find((c) => c.name === colorName);

  return color?.hex ?? product.colors[0].hex;

}

