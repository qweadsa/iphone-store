import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { cancelPayment } from "@/lib/payments/service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const result = await cancelPayment(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "取消失败" }, { status: 400 });
  }
  return NextResponse.json({ status: "cancelled" });
}
