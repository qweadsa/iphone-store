import fs from "fs";
import path from "path";
import sharp from "sharp";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const MOBILE_WIDTH = 280;
const MAX_WIDTH = 560;

if (!fs.existsSync(uploadsDir)) {
  console.log("no uploads dir");
  process.exit(0);
}

const files = fs.readdirSync(uploadsDir).filter((name) => /\.png$/i.test(name));

for (const name of files) {
  const input = path.join(uploadsDir, name);
  const base = name.replace(/\.png$/i, "");
  const bytes = fs.readFileSync(input);

  const resized = sharp(bytes, { failOn: "none" }).ensureAlpha().resize(MAX_WIDTH, MAX_WIDTH, {
    fit: "inside",
    withoutEnlargement: true,
  });

  await Promise.all([
    resized
      .clone()
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(input),
    resized
      .clone()
      .webp({ quality: 80, alphaQuality: 75, effort: 4 })
      .toFile(path.join(uploadsDir, `${base}.webp`)),
    sharp(bytes, { failOn: "none" })
      .ensureAlpha()
      .resize(MOBILE_WIDTH, MOBILE_WIDTH, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76, alphaQuality: 70, effort: 4 })
      .toFile(path.join(uploadsDir, `${base}.mobile.webp`)),
  ]);

  const pngKb = Math.round(fs.statSync(input).size / 1024);
  const webpKb = Math.round(fs.statSync(path.join(uploadsDir, `${base}.webp`)).size / 1024);
  const mobileKb = Math.round(
    fs.statSync(path.join(uploadsDir, `${base}.mobile.webp`)).size / 1024,
  );
  console.log(`${name} -> PNG ${pngKb}KB, WebP ${webpKb}KB, mobile ${mobileKb}KB`);
}
