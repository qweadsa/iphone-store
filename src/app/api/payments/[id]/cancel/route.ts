import { NextResponse } from "next/server";
import { cancelPayment } from "@/lib/payments/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await cancelPayment(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Cancel failed" }, { status: 400 });
  }
  return NextResponse.json({ status: "cancelled" });
}
