import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminApiErrorMessage } from "@/lib/admin-api-error";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const prizeType = String(body.prizeType ?? "").trim();
    if (!prizeType) {
      return NextResponse.json({ error: "缺少奖品类型标识，请刷新页面后重试" }, { status: 400 });
    }

    const prize = await prisma.blindBoxPrize.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        prizeType,
        subtitle: body.subtitle?.trim() || null,
        tier: body.tier ?? "rare",
        fulfillmentType: body.fulfillmentType ?? "none",
        weight: Number(body.weight) || 0,
        displayOdds: body.displayOdds?.trim() || null,
        emoji: body.emoji ?? "🎁",
        imageUrl: body.imageUrl || null,
        drawable: body.drawable ?? true,
        showInPool: body.showInPool ?? true,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(prize);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json(
      { error: adminApiErrorMessage(e, "保存失败") },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.blindBoxPrize.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json(
      { error: adminApiErrorMessage(e, "删除失败") },
      { status: 500 },
    );
  }
}
