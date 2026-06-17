import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || `prize-${Date.now()}`;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "请填写礼品名称" }, { status: 400 });
    }

    const maxOrder = await prisma.blindBoxPrize.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    let prizeType = String(body.prizeType ?? "").trim();
    if (!prizeType) prizeType = `${slugify(name)}-${Date.now().toString(36)}`;

    const existing = await prisma.blindBoxPrize.findFirst({ where: { prizeType } });
    if (existing) prizeType = `${prizeType}-${Date.now().toString(36)}`;

    const prize = await prisma.blindBoxPrize.create({
      data: {
        name,
        prizeType,
        subtitle: body.subtitle?.trim() || null,
        tier: body.tier ?? "rare",
        fulfillmentType: body.fulfillmentType ?? "none",
        weight: Number(body.weight) || 0,
        displayOdds: body.displayOdds?.trim() || null,
        emoji: body.emoji?.trim() || "🎁",
        imageUrl: body.imageUrl?.trim() || null,
        drawable: body.drawable ?? Number(body.weight) > 0,
        showInPool: body.showInPool ?? true,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? sortOrder,
      },
    });

    revalidatePath("/");
    return NextResponse.json(prize, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
