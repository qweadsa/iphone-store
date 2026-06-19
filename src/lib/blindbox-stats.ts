import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import {
  formatPublicWinnerLine,
  formatTimeAgo,
  toPublicWinnerRows,
  type GrandPrizeStatus,
  type PublicWinner,
  type PublicWinnerRow,
} from "@/lib/blindbox-public";

export type { GrandPrizeStatus, PublicWinner, PublicWinnerRow };
export { formatPublicWinnerLine, formatTimeAgo };

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getRealBlindBoxStats() {
  const since = startOfToday();
  const [playersToday, winnersToday, grandClaimed] = await Promise.all([
    prisma.payment.count({
      where: {
        purpose: "blindbox",
        status: "completed",
        updatedAt: { gte: since },
      },
    }),
    prisma.blindBoxDraw.count({
      where: { createdAt: { gte: since }, prizeType: { not: "retry" } },
    }),
    prisma.blindBoxDraw.findFirst({
      where: { createdAt: { gte: since }, prizeType: "grand" },
    }),
  ]);
  return {
    playersToday,
    winnersToday,
    grandPrizeStatus: (grandClaimed ? "claimed" : "available") as GrandPrizeStatus,
  };
}

export async function getRealBlindBoxStatsToday() {
  if (!isDatabaseConfigured) {
    return { playersToday: 0, winnersToday: 0, grandPrizeStatus: "available" as GrandPrizeStatus };
  }
  try {
    return await getRealBlindBoxStats();
  } catch {
    return { playersToday: 0, winnersToday: 0, grandPrizeStatus: "available" as GrandPrizeStatus };
  }
}

export async function getBlindBoxStats() {
  if (!isDatabaseConfigured) {
    return { playersToday: 0, winnersToday: 0, grandPrizeStatus: "available" as GrandPrizeStatus };
  }
  try {
    const config = await prisma.blindBoxConfig.findFirst({ where: { id: 1 } });
    const real = await getRealBlindBoxStats();

    if (config?.statsDemoMode === false) {
      return real;
    }

    return {
      playersToday: (config?.displayPlayersToday ?? 0) + real.playersToday,
      winnersToday: (config?.displayWinnersToday ?? 0) + real.winnersToday,
      grandPrizeStatus: real.grandPrizeStatus,
    };
  } catch {
    return { playersToday: 0, winnersToday: 0, grandPrizeStatus: "available" as GrandPrizeStatus };
  }
}

export async function getPublicWinnerRows(): Promise<PublicWinnerRow[]> {
  if (!isDatabaseConfigured) return [];
  try {
    const rows = await prisma.blindBoxDraw.findMany({
      where: {
        isVerified: true,
        allowPublicDisplay: true,
        prizeType: { not: "retry" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        prizeName: true,
        email: true,
        prizeType: true,
        createdAt: true,
      },
    });
    return toPublicWinnerRows(rows);
  } catch {
    return [];
  }
}

export async function getPublicWinners(locale: "zh" | "en" = "zh"): Promise<PublicWinner[]> {
  const rows = await getPublicWinnerRows();
  return rows.map((r) => ({
    id: r.id,
    text: formatPublicWinnerLine(r.prizeName, r.email, r.prizeType, locale),
    isGrand: r.prizeType === "grand",
  }));
}

/** @deprecated use getPublicWinners */
export async function getRecentWinnerLines(locale: "zh" | "en" = "zh") {
  const winners = await getPublicWinners(locale);
  return winners.map((w) => w.text);
}
