import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminApiErrorMessage } from "@/lib/admin-api-error";
import { getRealBlindBoxStatsToday } from "@/lib/blindbox-stats";
import { serializeDemoWinners } from "@/lib/demo-winners";
import { DEFAULT_GRAND_PRIZE_VALUE, DEFAULT_BLIND_BOX_PRICE } from "@/lib/market";

export async function GET() {
  try {
    await requireAdmin();
    const [config, prizes, realStatsToday] = await Promise.all([
      prisma.blindBoxConfig.findFirst({ where: { id: 1 } }),
      prisma.blindBoxPrize.findMany({ orderBy: { sortOrder: "asc" } }),
      getRealBlindBoxStatsToday(),
    ]);
    return NextResponse.json({ config, prizes, realStatsToday });
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
    const config = await prisma.blindBoxConfig.upsert({
      where: { id: 1 },
      update: {
        price: body.price,
        enabled: body.enabled,
        grandPrizeName: body.grandPrizeName,
        grandPrizeValue: body.grandPrizeValue,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        grandPrizeImageUrl: body.grandPrizeImageUrl,
        heroShowcaseJson: body.heroShowcaseJson ?? undefined,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        dailyLimit: body.dailyLimit ?? 0,
        winnersDemoMode: body.winnersDemoMode ?? true,
        statsDemoMode: body.statsDemoMode ?? true,
        displayPlayersToday: body.displayPlayersToday ?? 0,
        displayWinnersToday: body.displayWinnersToday ?? 0,
        demoWinnersJson: body.demoWinnersJson ?? undefined,
      },
      create: {
        id: 1,
        price: body.price ?? DEFAULT_BLIND_BOX_PRICE,
        enabled: body.enabled ?? true,
        grandPrizeName: body.grandPrizeName ?? "iPhone 17 Pro Max",
        grandPrizeValue: body.grandPrizeValue ?? DEFAULT_GRAND_PRIZE_VALUE,
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        grandPrizeImageUrl: body.grandPrizeImageUrl,
        heroShowcaseJson: body.heroShowcaseJson ?? undefined,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        dailyLimit: body.dailyLimit ?? 0,
        winnersDemoMode: body.winnersDemoMode ?? true,
        statsDemoMode: body.statsDemoMode ?? true,
        displayPlayersToday: body.displayPlayersToday ?? 128,
        displayWinnersToday: body.displayWinnersToday ?? 42,
        demoWinnersJson: body.demoWinnersJson ?? serializeDemoWinners([]),
      },
    });
    revalidatePath("/");
    return NextResponse.json(config);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json(
      { error: adminApiErrorMessage(e, "保存失败") },
      { status: 500 },
    );
  }
}
