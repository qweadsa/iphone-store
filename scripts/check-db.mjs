import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REQUIRED = {
  blind_box_config: ["winners_demo_mode", "daily_limit", "grand_prize_image_url"],
  blind_box_prizes: [
    "display_odds",
    "subtitle",
    "tier",
    "fulfillment_type",
    "drawable",
    "show_in_pool",
    "image_url",
  ],
};

async function listColumns(table) {
  const rows = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM ${table}`);
  return rows.map((row) => row.Field);
}

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("DB connection: OK");

  for (const [table, fields] of Object.entries(REQUIRED)) {
    const columns = await listColumns(table);
    const missing = fields.filter((field) => !columns.includes(field));
    if (missing.length > 0) {
      console.error(`TABLE ${table} missing columns: ${missing.join(", ")}`);
      console.error("Fix: npm run db:push   OR run database/init.sql ALTER section in Navicat");
      process.exitCode = 1;
    } else {
      console.log(`TABLE ${table}: OK`);
    }
  }

  const prizeCount = await prisma.blindBoxPrize.count();
  console.log(`blind_box_prizes rows: ${prizeCount}`);

  try {
    await prisma.blindBoxPrize.findFirst({
      select: { id: true, displayOdds: true, imageUrl: true },
    });
    console.log("Prisma client fields: OK");
  } catch (e) {
    console.error("Prisma client out of date:", e.message);
    console.error("Fix: npx prisma generate && restart npm run dev");
    process.exitCode = 1;
  }
} catch (e) {
  console.error("DB ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
