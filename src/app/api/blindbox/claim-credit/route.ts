import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/user-auth";
import { applyDrawCredit } from "@/lib/blindbox-credit";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const paymentId = body.paymentId?.trim();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment" }, { status: 400 });
    }

    const draw = await prisma.blindBoxDraw.findFirst({ where: { paymentId } });
    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }
    if (!draw.creditAmount || draw.creditAmount <= 0) {
      return NextResponse.json({ error: "此奖品不是钱包抵扣类型" }, { status: 400 });
    }
    if (draw.creditApplied) {
      return NextResponse.json({ credited: true, amount: draw.creditAmount });
    }

    const credited = await prisma.$transaction((tx) => applyDrawCredit(tx, draw, user.id));
    if (!credited) {
      return NextResponse.json({ error: "无法入账" }, { status: 400 });
    }

    return NextResponse.json({
      credited: true,
      amount: draw.creditAmount,
    });
  } catch {
    return NextResponse.json({ error: "入账失败" }, { status: 500 });
  }
}
