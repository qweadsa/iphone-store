import { PrismaClient } from "@prisma/client";
import { PRODUCT_IMAGES } from "../src/lib/product-images";

const prisma = new PrismaClient();

type SeedPrize = {
  prizeType: string;
  name: string;
  subtitle: string;
  tier: string;
  fulfillmentType: string;
  weight: number;
  displayOdds?: string;
  emoji: string;
  imageUrl?: string;
  drawable: boolean;
  showInPool: boolean;
  sortOrder: number;
};

async function main() {
  await prisma.blindBoxConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      price: 60,
      enabled: true,
      grandPrizeName: "iPhone 17 Pro Max",
      grandPrizeValue: "$1,199",
      heroTitle: "Win an iPhone 17 Pro Max",
      heroSubtitle:
        "Just $60 for one chance at the grand prize! Every box is a surprise.",
      seoTitle: "iPhone Mystery Box — Win iPhone 17 Pro Max for $60",
      seoDescription:
        "Try the $60 iPhone Mystery Box. Win an iPhone 17 Pro Max worth $1,199. Limited event, free shipping in the USA.",
    },
  });

  const prizes: SeedPrize[] = [
    {
      prizeType: "iphone-17-pro-max",
      name: "iPhone 17 Pro Max",
      subtitle: "1TB · Titanium",
      tier: "legendary",
      fulfillmentType: "grand",
      weight: 1,
      displayOdds: "0.8%",
      emoji: "📱",
      imageUrl: "/prizes/iphone-17-pro-max.svg",
      drawable: true,
      showInPool: true,
      sortOrder: 1,
    },
    {
      prizeType: "macbook-pro-16",
      name: 'MacBook Pro 16"',
      subtitle: "M4 Max · Pro Laptop",
      tier: "legendary",
      fulfillmentType: "none",
      weight: 0,
      emoji: "💻",
      imageUrl: "/prizes/macbook-pro.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 2,
    },
    {
      prizeType: "rtx-4090",
      name: "RTX 4090 Founders",
      subtitle: "Flagship GPU",
      tier: "legendary",
      fulfillmentType: "none",
      weight: 0,
      emoji: "🎮",
      imageUrl: "/prizes/rtx-4090.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 3,
    },
    {
      prizeType: "sony-a7iv",
      name: "Sony A7 IV Camera",
      subtitle: "Full-Frame Mirrorless",
      tier: "legendary",
      fulfillmentType: "none",
      weight: 0,
      emoji: "📷",
      imageUrl: "/prizes/sony-camera.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 4,
    },
    {
      prizeType: "rog-gaming-pc",
      name: "ROG Gaming Desktop",
      subtitle: "Liquid Cooled PC",
      tier: "epic",
      fulfillmentType: "case",
      weight: 5,
      emoji: "🖥️",
      imageUrl: "/prizes/gaming-pc.svg",
      drawable: true,
      showInPool: true,
      sortOrder: 5,
    },
    {
      prizeType: "airpods-max",
      name: "AirPods Max",
      subtitle: "Premium Audio",
      tier: "epic",
      fulfillmentType: "none",
      weight: 0,
      emoji: "🎧",
      imageUrl: "/prizes/airpods-max.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 6,
    },
    {
      prizeType: "ipad-pro-m4",
      name: "iPad Pro M4",
      subtitle: "OLED Display",
      tier: "epic",
      fulfillmentType: "none",
      weight: 0,
      emoji: "📲",
      imageUrl: "/prizes/ipad-pro.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 7,
    },
    {
      prizeType: "oled-monitor",
      name: "4K OLED Monitor",
      subtitle: "240Hz Display",
      tier: "rare",
      fulfillmentType: "none",
      weight: 0,
      emoji: "🖥️",
      imageUrl: "/prizes/oled-monitor.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 8,
    },
    {
      prizeType: "nvme-ssd",
      name: "2TB NVMe SSD",
      subtitle: "Gen5 Storage",
      tier: "rare",
      fulfillmentType: "none",
      weight: 0,
      emoji: "⚡",
      imageUrl: "/prizes/nvme-ssd.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 9,
    },
    {
      prizeType: "mechanical-keyboard",
      name: "Mechanical Keyboard",
      subtitle: "RGB Pro Series",
      tier: "uncommon",
      fulfillmentType: "none",
      weight: 0,
      emoji: "⌨️",
      imageUrl: "/prizes/keyboard.svg",
      drawable: false,
      showInPool: true,
      sortOrder: 10,
    },
    {
      prizeType: "store-credit-50",
      name: "$50 Store Credit",
      subtitle: "Instant Reward",
      tier: "rare",
      fulfillmentType: "credit",
      weight: 10,
      emoji: "💰",
      imageUrl: "/prizes/store-credit.svg",
      drawable: true,
      showInPool: true,
      sortOrder: 11,
    },
    {
      prizeType: "coupon-20",
      name: "20% Off Coupon",
      subtitle: "Member Exclusive",
      tier: "uncommon",
      fulfillmentType: "coupon",
      weight: 25,
      emoji: "🎟️",
      imageUrl: "/prizes/coupon.svg",
      drawable: true,
      showInPool: true,
      sortOrder: 12,
    },
    {
      prizeType: "retry",
      name: "Better Luck Next Time",
      subtitle: "Member Reward",
      tier: "uncommon",
      fulfillmentType: "retry",
      weight: 944,
      emoji: "🍀",
      imageUrl: "/prizes/member-reward.svg",
      drawable: true,
      showInPool: false,
      sortOrder: 99,
    },
  ];

  for (const p of prizes) {
    const existing = await prisma.blindBoxPrize.findFirst({
      where: { prizeType: p.prizeType },
    });
    if (existing) {
      await prisma.blindBoxPrize.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          subtitle: p.subtitle,
          tier: p.tier,
          fulfillmentType: p.fulfillmentType,
          weight: p.weight,
          displayOdds: p.displayOdds ?? null,
          emoji: p.emoji,
          imageUrl: p.imageUrl,
          drawable: p.drawable,
          showInPool: p.showInPool,
          sortOrder: p.sortOrder,
        },
      });
    } else {
      await prisma.blindBoxPrize.create({ data: p });
    }
  }

  // 移除旧版 5 类固定奖品（与新 slug 礼品重复）
  await prisma.blindBoxPrize.deleteMany({
    where: { prizeType: { in: ["grand", "credit", "case", "coupon"] } },
  });

  const products = [
    {
      slug: "iphone-17-pro-max",
      name: "iPhone 17 Pro Max",
      tagline: "The most powerful iPhone ever.",
      description: "6.9-inch Super Retina XDR display, A19 Pro chip.",
      category: "phone",
      badge: "new",
      imageUrl: PRODUCT_IMAGES["iphone-17-pro-max"],
      storageOptions: [
        { size: "256GB", price: 1199 },
        { size: "512GB", price: 1399 },
      ],
      colors: [
        { name: "Black Titanium", hex: "#3C3C3D" },
        { name: "Natural Titanium", hex: "#BFA48F" },
      ],
      features: ["A19 Pro chip", "6.9-inch display", "5x optical zoom"],
      sortOrder: 1,
    },
    {
      slug: "iphone-17-pro",
      name: "iPhone 17 Pro",
      tagline: "Pro power. Pocket size.",
      description: "6.3-inch Super Retina XDR display, A19 Pro chip.",
      category: "phone",
      badge: "new",
      imageUrl: PRODUCT_IMAGES["iphone-17-pro"],
      storageOptions: [
        { size: "128GB", price: 999 },
        { size: "256GB", price: 1099 },
      ],
      colors: [
        { name: "Black Titanium", hex: "#3C3C3D" },
        { name: "Natural Titanium", hex: "#BFA48F" },
      ],
      features: ["A19 Pro chip", "6.3-inch display", "Pro camera"],
      sortOrder: 2,
    },
    {
      slug: "iphone-17",
      name: "iPhone 17",
      tagline: "Camera Control. In your hand.",
      description: "6.1-inch Super Retina XDR display, A19 chip.",
      category: "phone",
      badge: "hot",
      imageUrl: PRODUCT_IMAGES["iphone-17"],
      storageOptions: [
        { size: "128GB", price: 799 },
        { size: "256GB", price: 899 },
      ],
      colors: [
        { name: "Ultramarine", hex: "#4A6FA5" },
        { name: "Black", hex: "#1D1D1F" },
      ],
      features: ["A19 chip", "Camera Control", "6.1-inch display"],
      sortOrder: 3,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { category: p.category, imageUrl: p.imageUrl },
      create: p,
    });
  }

  await prisma.product.updateMany({
    where: { category: { not: "phone" } },
    data: { active: false },
  });

  console.log("Seed data inserted.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
