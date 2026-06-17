import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserCookie, hashPassword } from "@/lib/user-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const name = body.name?.trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
      },
    });

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
    });
    res.cookies.set(await buildUserCookie(user.id));
    return res;
  } catch {
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
