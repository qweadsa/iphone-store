import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/** 清空用户/订单/支付等测试流水，保留产品、盲盒奖品、收款设置 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const [walletTx, draws, orderItems, orders, payments, users] =
      await prisma.$transaction([
        prisma.walletTransaction.deleteMany(),
        prisma.blindBoxDraw.deleteMany(),
        prisma.orderItem.deleteMany(),
        prisma.order.deleteMany(),
        prisma.payment.deleteMany(),
        prisma.user.deleteMany(),
      ]);

    await prisma.blindBoxConfig.updateMany({
      where: { id: 1 },
      data: { winnersDemoMode: false },
    });

    return NextResponse.json({
      ok: true,
      deleted: {
        users: users.count,
        payments: payments.count,
        orders: orders.count,
        orderItems: orderItems.count,
        draws: draws.count,
        walletTransactions: walletTx.count,
      },
    });
  } catch (e) {
    console.error("[admin/cleanup]", e);
    return NextResponse.json({ error: "清理失败，请检查数据库连接" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const [users, payments, orders, draws, pendingPayments] = await Promise.all([
    prisma.user.count(),
    prisma.payment.count(),
    prisma.order.count(),
    prisma.blindBoxDraw.count(),
    prisma.payment.count({ where: { status: "pending" } }),
  ]);

  const config = await prisma.blindBoxConfig.findFirst({ where: { id: 1 } });

  return NextResponse.json({
    users,
    payments,
    orders,
    draws,
    pendingPayments,
    winnersDemoMode: config?.winnersDemoMode ?? true,
  });
}
