import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMethodQr, getReceiveSettings } from "@/lib/payments/receive-qr";
import type { PaymentMethodId } from "@/lib/payments/methods";
import { CHECKOUT_METHODS } from "@/lib/payments/methods";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const method = (searchParams.get("method") ?? "paypal") as PaymentMethodId;

    if (!CHECKOUT_METHODS.some((m) => m.id === method)) {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { paymentId: id } });
    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const settings = await getReceiveSettings();
    const qr = await generateMethodQr(
      method,
      payment.amount,
      payment.paymentId,
      settings,
    );

    return NextResponse.json(qr);
  } catch {
    return NextResponse.json({ error: "QR generation failed" }, { status: 500 });
  }
}
