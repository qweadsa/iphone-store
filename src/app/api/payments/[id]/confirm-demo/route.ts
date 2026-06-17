import { NextResponse } from "next/server";
import { completePayment } from "@/lib/payments/service";
import { getPaymentRequireAdminConfirm } from "@/lib/payments/settings";
import { isProduction } from "@/lib/session-token";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  if (isProduction() && process.env.ALLOW_DEMO_PAYMENT !== "true") {
    return NextResponse.json({ error: "Demo payment disabled" }, { status: 403 });
  }

  const requireAdminConfirm = await getPaymentRequireAdminConfirm();  if (requireAdminConfirm) {
    return NextResponse.json(
      { error: "Payment awaiting merchant confirmation" },
      { status: 403 },
    );
  }

  const { id } = await params;
  let method = "demo";
  try {
    const body = await req.json();
    if (body.method) method = body.method;
  } catch {
    /* empty body ok */
  }
  const result = await completePayment(id, method);
  if (!result.ok) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  return NextResponse.json({ status: "completed", ...result });
}
