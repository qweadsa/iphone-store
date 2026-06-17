import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(products);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        slug: body.slug,
        name: body.name,
        tagline: body.tagline ?? "",
        description: body.description ?? "",
        category: body.category ?? "phone",
        badge: body.badge || null,
        imageUrl: body.imageUrl || null,
        storageOptions: body.storageOptions ?? [{ size: "256GB", price: 999 }],
        colors: body.colors ?? [{ name: "Black", hex: "#1D1D1F" }],
        features: body.features ?? [],
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
