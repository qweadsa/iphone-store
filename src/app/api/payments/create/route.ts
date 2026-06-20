import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/user-auth";
import { createPayment } from "@/lib/payments/service";
import type { PaymentPurpose } from "@/lib/payments/types";
import { getEmailValidationMessage, validateEmail } from "@/lib/email-validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const purpose = body.purpose as PaymentPurpose;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!purpose) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    const user = await getSessionUser();
    let payerEmail = user?.email;

    if (!user) {
      const emailCheck = validateEmail(String(body.email ?? ""));
      if (!emailCheck.valid) {
        return NextResponse.json(
          { error: getEmailValidationMessage(emailCheck.reason, "zh") },
          { status: 400 },
        );
      }
      payerEmail = emailCheck.normalized;
    }

    const result = await createPayment({
      amount,
      purpose,
      userId: user?.id,
      email: payerEmail,
      metadata: body.metadata,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
