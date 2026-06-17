import fs from "fs";
import path from "path";
import sharp from "sharp";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const MAX_WIDTH = 560;
const MOBILE_WIDTH = 360;

if (!fs.existsSync(uploadsDir)) {
  console.log("no uploads dir, skip");
  process.exit(0);
}

const files = fs
  .readdirSync(uploadsDir)
  .filter((name) => /\.png$/i.test(name) && !name.endsWith(".mobile.webp"));

let processed = 0;

for (const name of files) {
  const input = path.join(uploadsDir, name);
  const webpOut = input.replace(/\.png$/i, ".webp");
  const mobileWebpOut = input.replace(/\.png$/i, ".mobile.webp");
  const bytes = fs.readFileSync(input);

  const pipeline = sharp(bytes, { failOn: "none" })
    .ensureAlpha()
    .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true });

  const mobilePipeline = sharp(bytes, { failOn: "none" })
    .ensureAlpha()
    .resize(MOBILE_WIDTH, MOBILE_WIDTH, { fit: "inside", withoutEnlargement: true });

  await Promise.all([
    pipeline
      .clone()
      .webp({ quality: 80, alphaQuality: 75, effort: 4 })
      .toFile(webpOut),
    mobilePipeline
      .webp({ quality: 76, alphaQuality: 70, effort: 4 })
      .toFile(mobileWebpOut),
    pipeline
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(input),
  ]);

  const beforeKb = Math.round(bytes.length / 1024);
  const afterKb = Math.round(fs.statSync(input).size / 1024);
  const mobileKb = Math.round(fs.statSync(mobileWebpOut).size / 1024);
  console.log(`${name}: ${beforeKb}KB -> PNG ${afterKb}KB, mobile WebP ${mobileKb}KB`);
  processed++;
}

console.log(`optimized ${processed} upload(s)`);
