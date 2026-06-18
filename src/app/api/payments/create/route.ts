import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/user-auth";
import { createPayment } from "@/lib/payments/service";
import type { PaymentPurpose } from "@/lib/payments/types";

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
    const guestEmail = body.email?.trim().toLowerCase();

    if (!user) {
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        return NextResponse.json({ error: "Guest email required" }, { status: 400 });
      }
    }

    const result = await createPayment({
      amount,
      purpose,
      userId: user?.id,
      email: user?.email ?? guestEmail,
      metadata: body.metadata,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
