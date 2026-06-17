import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminApiErrorMessage } from "@/lib/admin-api-error";
import {
  blindBoxConfigNeedsCurrencyMigration,
  DEFAULT_BLIND_BOX_PRICE,
  DEFAULT_GRAND_PRIZE_VALUE,
  normalizeBlindBoxConfig,
  normalizeMarketText,
} from "@/lib/market";
import {
  parseDemoWinners,
  serializeDemoWinners,
  type DemoWinnerEntry,
} from "@/lib/demo-winners";
import {
  parseHeroShowcaseJson,
  serializeHeroShowcase,
} from "@/lib/hero-showcase";

async function loadNormalizedConfig() {
  const row = await prisma.blindBoxConfig.findFirst({ where: { id: 1 } });
  if (!row) return null;

  const normalized = normalizeBlindBoxConfig(row);
  const merged = { ...row, ...normalized };

  if (blindBoxConfigNeedsCurrencyMigration(row, normalized)) {
    const updated = await prisma.blindBoxConfig.update({
      where: { id: 1 },
      data: {
        price: normalized.price,
        grandPrizeValue: normalized.grandPrizeValue,
        heroSubtitle: normalized.heroSubtitle,
        heroTitle: normalized.heroTitle,
        seoTitle: normalized.seoTitle,
        seoDescription: normalized.seoDescription,
      },
    });
    return { ...updated, ...normalizeBlindBoxConfig(updated) };
  }
  return merged;
}

async function loadNormalizedPrizes() {
  const rows = await prisma.blindBoxPrize.findMany({ orderBy: { sortOrder: "asc" } });
  const updates: Promise<unknown>[] = [];

  const prizes = rows.map((row) => {
    const name = normalizeMarketText(row.name);
    if (name !== row.name) {
      updates.push(
        prisma.blindBoxPrize.update({ where: { id: row.id }, data: { name } }),
      );
      return { ...row, name };
    }
    return row;
  });

  if (updates.length) await Promise.all(updates);
  return prizes;
}

export async function GET() {
  try {
    await requireAdmin();
    const [config, prizes] = await Promise.all([
      loadNormalizedConfig(),
      loadNormalizedPrizes(),
    ]);
    const demoWinners = parseDemoWinners(config?.demoWinnersJson);
    const heroShowcase = parseHeroShowcaseJson(config?.heroShowcaseJson);
    return NextResponse.json({
      config: config ? { ...config, demoWinners, heroShowcase } : null,
      prizes,
    });
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
    const normalized = normalizeBlindBoxConfig({
      price: body.price,
      enabled: body.enabled,
      grandPrizeName: body.grandPrizeName,
      grandPrizeValue: body.grandPrizeValue,
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      grandPrizeImageUrl: body.grandPrizeImageUrl,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      dailyLimit: body.dailyLimit ?? 0,
      winnersDemoMode: body.winnersDemoMode ?? true,
    });

    const demoWinners = serializeDemoWinners(
      parseDemoWinners(body.demoWinners as DemoWinnerEntry[] | undefined),
    );
    const heroShowcase = serializeHeroShowcase(
      parseHeroShowcaseJson(body.heroShowcase),
    );
    const heroShowcaseJson = heroShowcase.length ? heroShowcase : Prisma.DbNull;
    const grandPrizeImageUrl =
      body.grandPrizeImageUrl?.trim() ||
      heroShowcase[0]?.src ||
      null;

    const config = await prisma.blindBoxConfig.upsert({
      where: { id: 1 },
      update: {
        price: normalized.price,
        enabled: body.enabled,
        grandPrizeName: body.grandPrizeName,
        grandPrizeValue: normalized.grandPrizeValue,
        heroTitle: normalized.heroTitle,
        heroSubtitle: normalized.heroSubtitle,
        grandPrizeImageUrl,
        heroShowcaseJson,
        seoTitle: normalized.seoTitle,
        seoDescription: normalized.seoDescription,
        dailyLimit: body.dailyLimit ?? 0,
        winnersDemoMode: body.winnersDemoMode ?? true,
        demoWinnersJson: demoWinners,
        statsDemoMode: body.statsDemoMode ?? true,
        displayPlayersToday: Math.max(0, Number(body.displayPlayersToday) || 0),
        displayWinnersToday: Math.max(0, Number(body.displayWinnersToday) || 0),
      },
      create: {
        id: 1,
        price: normalized.price ?? DEFAULT_BLIND_BOX_PRICE,
        enabled: body.enabled ?? true,
        grandPrizeName: body.grandPrizeName ?? "iPhone 17 Pro Max",
        grandPrizeValue: normalized.grandPrizeValue ?? DEFAULT_GRAND_PRIZE_VALUE,
        heroTitle: normalized.heroTitle,
        heroSubtitle: normalized.heroSubtitle,
        grandPrizeImageUrl,
        heroShowcaseJson,
        seoTitle: normalized.seoTitle,
        seoDescription: normalized.seoDescription,
        dailyLimit: body.dailyLimit ?? 0,
        winnersDemoMode: body.winnersDemoMode ?? true,
        demoWinnersJson: demoWinners,
        statsDemoMode: body.statsDemoMode ?? true,
        displayPlayersToday: Math.max(0, Number(body.displayPlayersToday) || 0),
        displayWinnersToday: Math.max(0, Number(body.displayWinnersToday) || 0),
      },
    });
    revalidatePath("/");

    return NextResponse.json({
      ...config,
      demoWinners: parseDemoWinners(config.demoWinnersJson),
      heroShowcase: parseHeroShowcaseJson(config.heroShowcaseJson),
    });
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
