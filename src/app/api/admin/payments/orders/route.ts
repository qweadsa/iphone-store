import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getPaymentTransferRef } from "@/lib/payment-ref";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim();
  const purpose = searchParams.get("purpose")?.trim();

  const where: {
    status?: string;
    purpose?: string;
  } = {};

  if (status && status !== "all") where.status = status;
  if (purpose && purpose !== "all") where.purpose = purpose;

  const limitRaw = Number(searchParams.get("limit") ?? "30");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 10), 100) : 30;

  const [totalCount, rows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const payments = rows.map((p) => ({
    paymentId: p.paymentId,
    amount: p.amount,
    status: p.status,
    purpose: p.purpose,
    method: p.method,
    provider: p.provider,
    email: p.email ?? p.user?.email ?? null,
    userName: p.user?.name ?? null,
    userId: p.userId,
    createdAt: p.createdAt.toISOString(),
    drawn: false as boolean,
    transferRef: getPaymentTransferRef(p.paymentId, p.metadata),
  }));

  const paymentIds = payments.map((p) => p.paymentId);
  if (paymentIds.length > 0) {
    const draws = await prisma.blindBoxDraw.findMany({
      where: { paymentId: { in: paymentIds } },
      select: { paymentId: true },
    });
    const drawnSet = new Set(draws.map((d) => d.paymentId));
    for (const p of payments) {
      p.drawn = drawnSet.has(p.paymentId);
    }
  }

  const pendingCount = await prisma.payment.count({ where: { status: "pending" } });
  const activePayments = await prisma.payment.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const active = activePayments.map((p) => ({
    paymentId: p.paymentId,
    amount: p.amount,
    status: p.status,
    purpose: p.purpose,
    email: p.email ?? p.user?.email ?? null,
    userName: p.user?.name ?? null,
    userId: p.userId,
    createdAt: p.createdAt.toISOString(),
    transferRef: getPaymentTransferRef(p.paymentId, p.metadata),
  }));

  return NextResponse.json({ payments, pendingCount, active, totalCount, limit });
}
