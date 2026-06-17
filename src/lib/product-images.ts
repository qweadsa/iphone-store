export const PRODUCT_IMAGES: Record<string, string> = {
  "iphone-17-pro-max": "/products/iphone-17-pro-max.png",
  "iphone-17-pro": "/products/iphone-17-pro.png",
  "iphone-17": "/products/iphone-17.png",
  "iphone-17-plus": "/products/iphone-17-plus.png",
  "macbook-pro-m4": "/products/macbook-pro-m4.png",
  "sony-a7iv": "/products/sony-a7iv.png",
};

export function getProductImageUrl(slug: string): string | null {
  return PRODUCT_IMAGES[slug] ?? null;
}
