import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCT_IMAGES = {
  "iphone-17-pro-max": "/products/iphone-17-pro-max.png",
  "iphone-17-pro": "/products/iphone-17-pro.png",
  "iphone-17-plus": "/products/iphone-17-plus.png",
  "iphone-17": "/products/iphone-17.png",
};

const SLUG_MAP = [
  ["iphone-16-pro-max", "iphone-17-pro-max", "iPhone 17 Pro Max"],
  ["iphone-16-pro", "iphone-17-pro", "iPhone 17 Pro"],
  ["iphone-16-plus", "iphone-17-plus", "iPhone 17 Plus"],
  ["iphone-16", "iphone-17", "iPhone 17"],
];

function upgradeText(text) {
  return text
    .replace(/A18 Pro/g, "A19 Pro")
    .replace(/A18/g, "A19")
    .replace(/iPhone 16 Pro Max/g, "iPhone 17 Pro Max")
    .replace(/iPhone 16 Pro/g, "iPhone 17 Pro")
    .replace(/iPhone 16 Plus/g, "iPhone 17 Plus")
    .replace(/iPhone 16/g, "iPhone 17");
}

try {
  for (const [oldSlug, newSlug, newName] of SLUG_MAP) {
    const row = await prisma.product.findUnique({ where: { slug: oldSlug } });
    if (!row) {
      console.log(`Skip: ${oldSlug} not found`);
      continue;
    }

    await prisma.product.update({
      where: { slug: oldSlug },
      data: {
        slug: newSlug,
        name: newName,
        tagline: upgradeText(row.tagline),
        description: upgradeText(row.description),
        features: JSON.parse(upgradeText(JSON.stringify(row.features))),
        imageUrl: PRODUCT_IMAGES[newSlug] ?? null,
      },
    });
    console.log(`Updated: ${oldSlug} -> ${newSlug}`);
  }
  console.log("Migration complete.");
} catch (e) {
  console.error("FAIL:", e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
