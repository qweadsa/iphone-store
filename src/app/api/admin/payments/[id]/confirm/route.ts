import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { completePayment } from "@/lib/payments/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const result = await completePayment(id, "admin");
  if (!result.ok) {
    return NextResponse.json({ error: "订单不存在或已处理" }, { status: 404 });
  }

  return NextResponse.json({ status: "completed", ...result });
}
