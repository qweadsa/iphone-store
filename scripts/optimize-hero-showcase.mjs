import fs from "fs";
import path from "path";
import sharp from "sharp";

const heroDir = path.join(process.cwd(), "public", "hero");
const MAX_WIDTH = 560;
const MOBILE_WIDTH = 280;

if (!fs.existsSync(heroDir)) {
  console.error("missing", heroDir);
  process.exit(1);
}

const files = fs
  .readdirSync(heroDir)
  .filter((name) => /^showcase-.*\.png$/i.test(name));

for (const name of files) {
  const input = path.join(heroDir, name);
  const webpOut = input.replace(/\.png$/i, ".webp");
  const mobileWebpOut = input.replace(/\.png$/i, ".mobile.webp");
  const bytes = fs.readFileSync(input);

  const pipeline = sharp(bytes).resize(MAX_WIDTH, MAX_WIDTH, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const mobilePipeline = sharp(bytes).resize(MOBILE_WIDTH, MOBILE_WIDTH, {
    fit: "inside",
    withoutEnlargement: true,
  });

  await Promise.all([
    pipeline
      .clone()
      .webp({ quality: 82, alphaQuality: 80, effort: 4 })
      .toFile(webpOut),
    mobilePipeline
      .webp({ quality: 76, alphaQuality: 70, effort: 4 })
      .toFile(mobileWebpOut),
    pipeline
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(input),
  ]);

  const pngKb = Math.round(fs.statSync(input).size / 1024);
  const webpKb = Math.round(fs.statSync(webpOut).size / 1024);
  const mobileKb = Math.round(fs.statSync(mobileWebpOut).size / 1024);
  console.log(`${name} -> PNG ${pngKb}KB, WebP ${webpKb}KB, mobile ${mobileKb}KB`);
}
