import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSupportUrl } from "@/lib/support-url";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
    const support = normalizeSupportUrl(settings?.supportTelegramUrl);
    return NextResponse.json({
      supportUrl: support?.url ?? null,
      supportChannel: support?.channel ?? null,
    });
  } catch {
    return NextResponse.json({ supportUrl: null, supportChannel: null });
  }
}
