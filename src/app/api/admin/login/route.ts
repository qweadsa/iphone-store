import { NextResponse } from "next/server";
import { buildAdminCookie, getAdminPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== getAdminPassword()) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(await buildAdminCookie());
  return res;
}
