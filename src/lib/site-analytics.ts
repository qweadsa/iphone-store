import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export type TrafficStats = {
  today: { visitors: number; pageViews: number };
  lastHour: { visitors: number; pageViews: number };
  live: {
    active: boolean;
    startedAt: string | null;
    visitors: number;
    pageViews: number;
  };
  recent: {
    id: number;
    path: string;
    referrer: string | null;
    createdAt: string;
  }[];
  recentPagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function hashVisitorKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export function buildVisitorKey(input: {
  /** Cookie already stored in the browser — stable across refreshes */
  persistedVisitorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): string {
  const persisted = input.persistedVisitorId?.trim();
  if (persisted) {
    return hashVisitorKey(`vid:${persisted}`);
  }
  // Cookie missing or first visit: fingerprint by IP + browser so refreshes don't inflate counts
  return hashVisitorKey(
    `fp:${input.ip?.trim() || "unknown"}|${input.userAgent?.trim() || "unknown"}`,
  );
}

export async function recordSiteVisit(input: {
  visitorHash: string;
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
}) {
  const path = input.path.slice(0, 500);
  await prisma.siteVisit.create({
    data: {
      visitorHash: input.visitorHash,
      path,
      referrer: input.referrer?.slice(0, 500) || null,
      userAgent: input.userAgent?.slice(0, 500) || null,
    },
  });
}

async function countPeriod(since: Date) {
  const [pageViews, groups] = await Promise.all([
    prisma.siteVisit.count({ where: { createdAt: { gte: since } } }),
    prisma.siteVisit.groupBy({
      by: ["visitorHash"],
      where: { createdAt: { gte: since } },
    }),
  ]);
  return {
    pageViews,
    visitors: groups.length,
  };
}

export async function getTrafficStats(options?: {
  recentPage?: number;
  recentLimit?: number;
}): Promise<TrafficStats> {
  const recentPage = options?.recentPage ?? 1;
  const recentLimit = options?.recentLimit ?? 30;
  const recentSkip = (recentPage - 1) * recentLimit;

  const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
  const liveStartedAt = settings?.liveCountStartedAt ?? null;
  const todayStart = startOfToday();
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);

  const [today, lastHourStats, liveStats, recentTotal, recentRows] = await Promise.all([
    countPeriod(todayStart),
    countPeriod(lastHour),
    liveStartedAt ? countPeriod(liveStartedAt) : Promise.resolve({ visitors: 0, pageViews: 0 }),
    prisma.siteVisit.count(),
    prisma.siteVisit.findMany({
      orderBy: { createdAt: "desc" },
      skip: recentSkip,
      take: recentLimit,
      select: { id: true, path: true, referrer: true, createdAt: true },
    }),
  ]);

  return {
    today,
    lastHour: lastHourStats,
    live: {
      active: liveStartedAt != null,
      startedAt: liveStartedAt?.toISOString() ?? null,
      visitors: liveStats.visitors,
      pageViews: liveStats.pageViews,
    },
    recent: recentRows.map((r) => ({
      id: r.id,
      path: r.path,
      referrer: r.referrer,
      createdAt: r.createdAt.toISOString(),
    })),
    recentPagination: {
      total: recentTotal,
      page: recentPage,
      totalPages: Math.max(1, Math.ceil(recentTotal / recentLimit)),
      limit: recentLimit,
    },
  };
}

export async function startLiveTrafficCount() {
  const at = new Date();
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, liveCountStartedAt: at },
    update: { liveCountStartedAt: at },
  });
  return at;
}

export async function resetLiveTrafficCount() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, liveCountStartedAt: null },
    update: { liveCountStartedAt: null },
  });
}

export function shouldTrackVisit(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico" || pathname === "/robots.txt") return false;
  if (pathname.startsWith("/sitemap")) return false;
  if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|map)$/i.test(pathname)) return false;
  return true;
}

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(userAgent);
}
