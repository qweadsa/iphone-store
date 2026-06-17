import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminLoginPath } from "@/lib/admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true, loginPath: getAdminLoginPath() });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
