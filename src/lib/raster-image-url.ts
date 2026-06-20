/** Shared helpers for locally uploaded raster images (PNG + generated WebP variants). */

export function isLocalRasterPng(src: string): boolean {
  return src.startsWith("/") && /\.png$/i.test(src);
}

export function getWebpUrl(src: string): string {
  return src.replace(/\.png$/i, ".webp");
}

export function getMobileWebpUrl(src: string): string {
  return src.replace(/\.png$/i, ".mobile.webp");
}

/** Pick the smallest suitable variant for display width (px). */
export function getResponsiveRasterUrl(src: string, displayWidth: number): string {
  if (!isLocalRasterPng(src)) return src;
  return displayWidth <= 120 ? getMobileWebpUrl(src) : getWebpUrl(src);
}
