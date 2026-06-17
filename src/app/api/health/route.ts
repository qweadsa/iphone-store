import { NextResponse } from "next/server";
import { isDatabaseConfigured, testDbConnection, prisma } from "@/lib/prisma";

export async function GET() {
  const dbConfigured = isDatabaseConfigured;
  const dbConnected = dbConfigured ? await testDbConnection() : false;
  let productCount: number | null = null;
  if (dbConnected) {
    try {
      productCount = await prisma.product.count({ where: { active: true } });
    } catch {
      productCount = null;
    }
  }

  return NextResponse.json({
    ok: true,
    database: {
      configured: dbConfigured,
      connected: dbConnected,
      productCount,
    },
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    admin: "http://localhost:3000/admin/login",
  });
}
