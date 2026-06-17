import { NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/user-auth";
import { cookieSecureFlag } from "@/lib/session-token";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, "", {
    httpOnly: true,
    secure: cookieSecureFlag(),
    path: "/",
    maxAge: 0,
  });
  return res;
}
