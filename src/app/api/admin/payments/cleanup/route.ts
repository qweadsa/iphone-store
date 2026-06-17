import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/** 清除已完成 / 已取消付款记录（保留正在付款中的 pending） */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let scope = "completed_cancelled";
  try {
    const body = await req.json().catch(() => ({}));
    if (body.scope === "completed" || body.scope === "cancelled" || body.scope === "completed_cancelled") {
      scope = body.scope;
    }
  } catch {
    /* default scope */
  }

  const where =
    scope === "completed"
      ? { status: "completed" }
      : scope === "cancelled"
        ? { status: "cancelled" }
        : { status: { in: ["completed", "cancelled"] } };

  try {
    const result = await prisma.payment.deleteMany({ where });
    return NextResponse.json({ ok: true, deleted: result.count, scope });
  } catch (e) {
    console.error("[admin/payments/cleanup]", e);
    return NextResponse.json({ error: "清除失败" }, { status: 500 });
  }
}
