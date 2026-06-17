const HERO_MAX_WIDTH = 560;

export function heroSupportsWebp(src: string): boolean {
  return src.startsWith("/hero/") && /\.png$/i.test(src);
}

export function getHeroWebpUrl(src: string): string {
  return src.replace(/\.png$/i, ".webp");
}

export const HERO_IMAGE_DISPLAY_WIDTH = HERO_MAX_WIDTH;
export const HERO_IMAGE_DISPLAY_HEIGHT = 720;
