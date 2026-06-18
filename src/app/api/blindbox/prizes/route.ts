import { NextResponse } from "next/server";
import { getBlindBoxPrizes } from "@/lib/cms";
import { isPoolVisiblePrize, isReelVisiblePrize } from "@/lib/blindbox-prize-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const prizes = await getBlindBoxPrizes();
  const pool = prizes.filter(isPoolVisiblePrize);
  const reel = prizes.filter(isReelVisiblePrize);
  return NextResponse.json({
    total: prizes.length,
    poolCount: pool.length,
    reelCount: reel.length,
    pool,
    reel,
  });
}
