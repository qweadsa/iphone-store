import { NextResponse } from "next/server";
import { getProducts } from "@/lib/cms";

/** 前台产品列表（读 Navicat / 后台同一套 products 表） */
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({
      count: products.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        image: p.image || p.imageUrl || null,
        priceFrom: p.storageOptions[0]?.price ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}
