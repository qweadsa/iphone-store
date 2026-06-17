import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";

const assetsDir = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  "c-Users-Administrator-Projects-iphone-store",
  "assets",
);
const heroDir = path.join(process.cwd(), "public", "hero");

const SHOWCASE = [
  { id: "eaa63e4e", out: "showcase-01-iphone-white.png", wide: true },
  { id: "7f838be8", out: "showcase-02-iphone-blue.png", wide: true },
  { id: "e5421a8f", out: "showcase-03-iphone-orange-dual.png", wide: true },
  { id: "f6f951e0", out: "showcase-04-iphone-orange-angle.png" },
  { id: "66d24e76", out: "showcase-05-ipad-pro.png", wide: true },
  { id: "d410f3f6", out: "showcase-06-macbook-pro.png", wide: true },
  { id: "ccdbf522", out: "showcase-07-gaming-pc.png", wide: true },
];

function isCheckerboard(r, g, b) {
  if (Math.abs(r - g) > 10 || Math.abs(g - b) > 10) return false;
  // Only strip true Photoshop/Cursor checkerboard tiles (#FFF / #CCC), not product silver.
  if (r >= 248) return true;
  if (r >= 198 && r <= 212) return true;
  return false;
}

function findAsset(id) {
  if (!fs.existsSync(assetsDir)) return null;
  const match = fs.readdirSync(assetsDir).find((name) => name.includes(id));
  return match ? path.join(assetsDir, match) : null;
}

function resolveInput(inputPath) {
  if (process.platform !== "win32") return inputPath;
  const resolved = path.resolve(inputPath);
  return resolved.startsWith("\\\\?\\") ? resolved : `\\\\?\\${resolved}`;
}

async function stripCheckerboard(inputPath, outputPath) {
  const bytes = fs.readFileSync(resolveInput(inputPath));
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

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
}

fs.mkdirSync(heroDir, { recursive: true });

for (const item of SHOWCASE) {
  const input = findAsset(item.id);
  const output = path.join(heroDir, item.out);
  if (!input) {
    console.warn("missing asset for", item.id, "->", item.out);
    continue;
  }
  await stripCheckerboard(input, output);
  console.log("processed", item.out);
}
