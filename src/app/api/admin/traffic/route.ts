import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getTrafficStats,
  resetLiveTrafficCount,
  startLiveTrafficCount,
} from "@/lib/site-analytics";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getTrafficStats();
    return NextResponse.json(stats);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "加载失败" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "start-live") {
      const startedAt = await startLiveTrafficCount();
      const stats = await getTrafficStats();
      return NextResponse.json({ ok: true, startedAt: startedAt.toISOString(), stats });
    }

    if (action === "reset-live") {
      await resetLiveTrafficCount();
      const stats = await getTrafficStats();
      return NextResponse.json({ ok: true, stats });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
