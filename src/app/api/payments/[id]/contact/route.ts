import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmailValidationMessage, validateEmail } from "@/lib/email-validation";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const emailCheck = validateEmail(String(body.email ?? ""));

  if (!emailCheck.valid) {
    const locale = String(body.locale ?? "en");
    return NextResponse.json(
      { error: getEmailValidationMessage(emailCheck.reason, locale) },
      { status: 400 },
    );
  }

  const payment = await prisma.payment.findUnique({ where: { paymentId: id } });
  if (!payment || payment.status !== "pending") {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  if (payment.userId) {
    return NextResponse.json({ error: "Already linked to account" }, { status: 400 });
  }

  await prisma.payment.update({
    where: { paymentId: id },
    data: { email: emailCheck.normalized },
  });

  return NextResponse.json({ ok: true, email: emailCheck.normalized });
}
