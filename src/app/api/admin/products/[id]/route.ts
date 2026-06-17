import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) return NextResponse.json({ error: "未找到" }, { status: 404 });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        slug: body.slug,
        name: body.name,
        tagline: body.tagline,
        description: body.description,
        category: body.category,
        badge: body.badge || null,
        imageUrl: body.imageUrl || null,
        storageOptions: body.storageOptions,
        colors: body.colors,
        features: body.features,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        active: body.active,
        sortOrder: body.sortOrder,
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
