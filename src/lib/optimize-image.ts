import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const UPLOAD_MAX_WIDTH = 560;
export const MOBILE_MAX_WIDTH = 280;

export type OptimizedRaster = {
  png: Buffer;
  webp: Buffer;
  mobileWebp: Buffer;
};

export async function optimizeRasterBuffer(bytes: Buffer): Promise<OptimizedRaster> {
  const resized = sharp(bytes, { failOn: "none" })
    .ensureAlpha()
    .resize(UPLOAD_MAX_WIDTH, UPLOAD_MAX_WIDTH, {
      fit: "inside",
      withoutEnlargement: true,
    });

  const [png, webp, mobileWebp] = await Promise.all([
    resized
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer(),
    resized
      .clone()
      .webp({ quality: 80, alphaQuality: 75, effort: 4 })
      .toBuffer(),
    sharp(bytes, { failOn: "none" })
      .ensureAlpha()
      .resize(MOBILE_MAX_WIDTH, MOBILE_MAX_WIDTH, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 76, alphaQuality: 70, effort: 4 })
      .toBuffer(),
  ]);

  return { png, webp, mobileWebp };
}

export async function writeOptimizedRasterFiles(
  dir: string,
  basename: string,
  files: OptimizedRaster,
): Promise<void> {
  await Promise.all([
    writeFile(join(dir, `${basename}.png`), files.png),
    writeFile(join(dir, `${basename}.webp`), files.webp),
    writeFile(join(dir, `${basename}.mobile.webp`), files.mobileWebp),
  ]);
}
