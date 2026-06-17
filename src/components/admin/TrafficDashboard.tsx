"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrafficStats } from "@/lib/site-analytics";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function StatCard({
  label,
  visitors,
  pageViews,
  highlight = false,
}: {
  label: string;
  visitors: number;
  pageViews: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-orange-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-4xl font-black text-amber-400">{visitors.toLocaleString()}</p>
      <p className="mt-1 text-xs text-white/45">独立访客</p>
      <p className="mt-3 text-lg font-semibold text-white/80">{pageViews.toLocaleString()}</p>
      <p className="text-xs text-white/45">浏览次数</p>
    </div>
  );
}

export default function TrafficDashboard() {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/traffic", { cache: "no-store" });
    if (res.ok) {
      setStats((await res.json()) as TrafficStats);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(id);
  }, [load]);

  async function runAction(action: "start-live" | "reset-live") {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      stats?: TrafficStats;
      error?: string;
    };
    if (res.ok && data.stats) {
      setStats(data.stats);
      setMsg(action === "start-live" ? "✅ 已开始本场直播计数" : "✅ 已重置直播计数");
    } else {
      setMsg(`❌ ${data.error || "操作失败"}`);
    }
    setBusy(false);
  }

  if (loading && !stats) {
    return <p className="text-white/50">加载访问数据...</p>;
  }

  if (!stats) {
    return <p className="text-red-400">无法加载访问数据，请确认数据库已更新（prisma db push）</p>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-amber-300">本场直播引流</h2>
            <p className="mt-1 max-w-xl text-sm text-white/60">
              开播前点「开始计数」，直播期间这里会实时显示有多少人打开网站（直接口播网址即可，无需特殊链接）。数字每 5 秒自动刷新。
            </p>
            {stats.live.active && stats.live.startedAt && (
              <p className="mt-2 text-xs text-white/45">
                计数开始于：{fmtTime(stats.live.startedAt)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAction("start-live")}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              开始本场直播计数
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAction("reset-live")}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              重置计数
            </button>
          </div>
        </div>
        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="本场直播（自点击开始）"
          visitors={stats.live.visitors}
          pageViews={stats.live.pageViews}
          highlight
        />
        <StatCard
          label="最近 1 小时"
          visitors={stats.lastHour.visitors}
          pageViews={stats.lastHour.pageViews}
        />
        <StatCard
          label="今日累计"
          visitors={stats.today.visitors}
          pageViews={stats.today.pageViews}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-semibold">最近访问记录</h3>
        <p className="mt-1 text-xs text-white/45">不含后台与机器人爬虫</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/45">
                <th className="pb-2 pr-4 font-medium">时间</th>
                <th className="pb-2 pr-4 font-medium">页面</th>
                <th className="pb-2 font-medium">来源</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-white/40">
                    暂无访问记录
                  </td>
                </tr>
              ) : (
                stats.recent.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 text-white/75">
                    <td className="py-2.5 pr-4 whitespace-nowrap">{fmtTime(row.createdAt)}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs">{row.path}</td>
                    <td className="py-2.5 max-w-[240px] truncate text-xs text-white/50">
                      {row.referrer || "直接访问 / 未知"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
