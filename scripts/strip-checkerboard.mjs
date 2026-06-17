import fs from "fs";
import path from "path";
import sharp from "sharp";

const dir = path.join(process.cwd(), "public", "hero");
const files = [
  "iphone-cutout-front",
  "iphone-cutout-angle",
  "iphone-cutout-back",
  "iphone-cutout-dual",
];

function isCheckerboard(r, g, b) {
  if (Math.abs(r - g) > 12 || Math.abs(g - b) > 12) return false;
  return r >= 165;
}

for (const base of files) {
  const inputPath = path.join(dir, `${base}.png`);
  const outputPath = path.join(dir, `${base}-alpha.png`);

  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i + 3] = isCheckerboard(r, g, b) ? 0 : 255;
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log("processed", base, `${info.width}x${info.height}`);
}
