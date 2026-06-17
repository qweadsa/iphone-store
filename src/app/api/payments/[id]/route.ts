import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { paymentId: id } });
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    paymentId: payment.paymentId,
    amount: payment.amount,
    status: payment.status,
    purpose: payment.purpose,
    payUrl: payment.payUrl,
    method: payment.method,
  });
}
