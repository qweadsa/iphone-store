import { NextResponse } from "next/server";
import { buildAdminCookie, getAdminPassword } from "@/lib/admin-auth";
import {
  checkLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
  securePasswordMatch,
} from "@/lib/admin-login-guard";

export async function POST(req: Request) {
  const gate = checkLoginAllowed(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "无效请求" }, { status: 400 });
  }

  if (!securePasswordMatch(password, getAdminPassword())) {
    recordLoginFailure(req);
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  recordLoginSuccess(req);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(await buildAdminCookie());
  return res;
}
