import { NextResponse } from "next/server";
import { getBlindBoxStats, getPublicWinners } from "@/lib/blindbox-stats";

export async function GET(req: Request) {
  try {
    const locale = new URL(req.url).searchParams.get("locale") === "zh" ? "zh" : "en";
    const [stats, winners] = await Promise.all([
      getBlindBoxStats(),
      getPublicWinners(locale),
    ]);
    return NextResponse.json({ ...stats, winners });
  } catch {
    return NextResponse.json(
      { playersToday: 0, winnersToday: 0, grandPrizeStatus: "available", winners: [] },
      { status: 200 },
    );
  }
}
