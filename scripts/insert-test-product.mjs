import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slug = "navicat-test-product";

try {
  await prisma.product.upsert({
    where: { slug },
    update: { active: true },
    create: {
      slug,
      name: "Navicat 测试产品",
      tagline: "在 Navicat 添加后会自动显示",
      description: "这是测试产品，验证数据库与网站同步。",
      category: "phone",
      badge: "new",
      storageOptions: [{ size: "128GB", price: 599 }],
      colors: [{ name: "Blue", hex: "#4A6FA5" }],
      features: ["测试同步", "Navicat 可用"],
      active: true,
      sortOrder: 99,
    },
  });
  const count = await prisma.product.count({ where: { active: true } });
  console.log("OK: inserted/updated", slug);
  console.log("active products:", count);
  console.log("view: http://localhost:3000/products/" + slug);
} catch (e) {
  console.error("FAIL:", e.message);
} finally {
  await prisma.$disconnect();
}
