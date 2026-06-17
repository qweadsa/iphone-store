import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserCookie, verifyPassword } from "@/lib/user-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
    });
    res.cookies.set(await buildUserCookie(user.id));
    return res;
  } catch {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
