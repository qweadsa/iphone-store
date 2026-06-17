import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeSupportUrl } from "@/lib/support-url";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    return NextResponse.json(settings);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const fields: Record<string, string | null> = {};

    if ("supportTelegramUrl" in body) {
      const raw = body.supportTelegramUrl?.trim() || "";
      if (raw && !normalizeSupportUrl(raw)) {
        return NextResponse.json({ error: "客服链接格式无效（支持 WhatsApp 或 Telegram）" }, { status: 400 });
      }
      fields.supportTelegramUrl = raw || null;
    }

    for (const key of [
      "homeSeoTitle",
      "homeSeoDescription",
      "paypalMe",
      "paypalEmail",
      "venmoUsername",
      "zelleContact",
      "receiveLink",
      "receiveNote",
    ] as const) {
      if (key in body) fields[key] = body[key] ?? null;
    }

    const boolFields: Record<string, boolean> = {};
    if ("paymentRequireAdminConfirm" in body) {
      boolFields.paymentRequireAdminConfirm = !!body.paymentRequireAdminConfirm;
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: { ...fields, ...boolFields },
      create: { id: 1, ...fields, ...boolFields },
    });
    return NextResponse.json(settings);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
