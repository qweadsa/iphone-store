import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { completePayment } from "@/lib/payments/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const token = searchParams.get("token");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!paymentId || !token) {
    return NextResponse.redirect(`${siteUrl}/pay?error=missing`);
  }

  const payment = await prisma.payment.findUnique({ where: { paymentId } });
  if (!payment) {
    return NextResponse.redirect(`${siteUrl}/pay?error=notfound`);
  }

  if (payment.status !== "completed") {
    const captured = await capturePayPalOrder(token);
    if (captured) {
      await completePayment(paymentId, "paypal");
    }
  }

  return NextResponse.redirect(`${siteUrl}/pay/${paymentId}?success=1`);
}
