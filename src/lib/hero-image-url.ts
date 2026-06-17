const HERO_MAX_WIDTH = 560;
const HERO_MOBILE_MAX_WIDTH = 280;

export function isLocalRasterPng(src: string): boolean {
  return src.startsWith("/") && /\.png$/i.test(src);
}

/** @deprecated use isLocalRasterPng */
export function heroSupportsWebp(src: string): boolean {
  return isLocalRasterPng(src);
}

export function getHeroWebpUrl(src: string): string {
  return src.replace(/\.png$/i, ".webp");
}

export function getHeroMobileWebpUrl(src: string): string {
  return src.replace(/\.png$/i, ".mobile.webp");
}

export const HERO_IMAGE_DISPLAY_WIDTH = HERO_MAX_WIDTH;
export const HERO_IMAGE_DISPLAY_HEIGHT = 720;
export const HERO_IMAGE_MOBILE_WIDTH = HERO_MOBILE_MAX_WIDTH;
