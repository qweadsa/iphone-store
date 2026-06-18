"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrafficStats } from "@/lib/site-analytics";

const PAGE_SIZE = 30;

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

function pathLabel(path: string): string {
  if (path === "/" || path === "") return "首页";
  if (path.startsWith("/products/")) return "产品详情";
  if (path === "/products") return "产品列表";
  if (path.startsWith("/orders")) return "订单查询";
  if (path.startsWith("/prize")) return "填写地址";
  if (path.startsWith("/cart")) return "购物车";
  if (path.startsWith("/login")) return "登录";
  if (path.startsWith("/register")) return "注册";
  if (path.startsWith("/account")) return "账户";
  if (path.startsWith("/pay/")) return "支付页";
  return "其他页面";
}

function formatReferrer(referrer: string | null): string {
  if (!referrer?.trim()) return "直接访问";
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "teumu.online" || host.endsWith(".teumu.online")) {
      const from = url.pathname === "/" ? "首页" : url.pathname;
      return `站内 · ${from}`;
    }
    return host;
  } catch {
    return referrer.length > 48 ? `${referrer.slice(0, 48)}…` : referrer;
  }
}

function StatCard({
  label,
  visitors,
  pageViews,
  highlight = false,
  onReset,
  resetDisabled = false,
}: {
  label: string;
  visitors: number;
  pageViews: number;
  highlight?: boolean;
  onReset?: () => void;
  resetDisabled?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-orange-500/5"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-white/50">{label}</p>
        {onReset && (
          <button
            type="button"
            disabled={resetDisabled}
            onClick={onReset}
            className="shrink-0 rounded-md border border-white/15 px-2 py-0.5 text-[11px] text-white/55 hover:bg-white/5 disabled:opacity-40"
          >
            重置
          </button>
        )}
      </div>
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
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (targetPage = page) => {
    const res = await fetch(`/api/admin/traffic?page=${targetPage}`, { cache: "no-store" });
    if (res.ok) {
      setStats((await res.json()) as TrafficStats);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    void load(page);
    const id = window.setInterval(() => void load(page), 5000);
    return () => window.clearInterval(id);
  }, [load, page]);

  async function runAction(
    action: "start-live" | "reset-live" | "reset-all" | "reset-today" | "reset-last-hour",
  ) {
    const confirmMessages: Partial<Record<typeof action, string>> = {
      "reset-all":
        "确定清空全部访问记录吗？\n\n将删除所有浏览数据并重置直播计数，且无法恢复。",
      "reset-today":
        "确定重置「今日累计」吗？\n\n将删除今天 0 点以来的所有访问记录，且无法恢复。",
      "reset-last-hour":
        "确定重置「最近 1 小时」吗？\n\n将删除过去 1 小时内的访问记录，且无法恢复。",
      "reset-live": "确定重置本场直播计数起点吗？\n\n不会删除历史记录，只是重新从 0 开始计本场。",
    };

    const confirmText = confirmMessages[action];
    if (confirmText && !window.confirm(confirmText)) return;

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
      setPage(1);
      setLastUpdated(new Date());
      const successMessages: Record<typeof action, string> = {
        "start-live": "✅ 已开始本场直播计数",
        "reset-live": "✅ 已重置本场直播计数",
        "reset-all": "✅ 已清空全部访问数据",
        "reset-today": "✅ 已重置今日累计",
        "reset-last-hour": "✅ 已重置最近 1 小时",
      };
      setMsg(successMessages[action]);
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

  const pagination = stats.recentPagination ?? {
    total: stats.recent.length,
    page: 1,
    totalPages: 1,
    limit: PAGE_SIZE,
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-amber-300">每日访问（自动统计）</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/60">
              用户打开或点击进入某个前台页面，浏览次数 +1（例如：首页 → 商城 → 订单 = 3 次）。
              导航栏后台预加载、图片资源不计入。同一页面 3 秒内重复刷新不重复计数。
              独立访客按浏览器识别，同一设备刷新不重复累加。
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {lastUpdated && (
              <p className="text-xs text-white/35">
                数据每 5 秒刷新 · 上次 {fmtTime(lastUpdated.toISOString())}
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void runAction("reset-all")}
              className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              清空全部访问数据
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white/90">直播专场计数（可选）</h2>
            <p className="mt-1 max-w-xl text-sm text-white/60">
              只在直播需要单独统计「从开播起」多少人访问时使用。不影响上面的「今日累计」。
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
              重置直播起点
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
          resetDisabled={busy}
          onReset={() => void runAction("reset-live")}
        />
        <StatCard
          label="最近 1 小时"
          visitors={stats.lastHour.visitors}
          pageViews={stats.lastHour.pageViews}
          resetDisabled={busy}
          onReset={() => void runAction("reset-last-hour")}
        />
        <StatCard
          label="今日累计"
          visitors={stats.today.visitors}
          pageViews={stats.today.pageViews}
          resetDisabled={busy}
          onReset={() => void runAction("reset-today")}
        />
      </div>

      {msg && <p className="text-sm text-white/70">{msg}</p>}

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">最近访问记录</h3>
            <p className="mt-1 text-xs text-white/45">不含后台与机器人爬虫</p>
          </div>
          <p className="text-xs text-white/35">全站累计 {pagination.total.toLocaleString()} 条访问</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/45">
                <th className="pb-2 pr-4 font-medium">时间</th>
                <th className="pb-2 pr-4 font-medium">类型</th>
                <th className="pb-2 pr-4 font-medium">页面</th>
                <th className="pb-2 font-medium">来源</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-white/40">
                    暂无访问记录
                  </td>
                </tr>
              ) : (
                stats.recent.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 text-white/75">
                    <td className="py-2.5 pr-4 whitespace-nowrap">{fmtTime(row.createdAt)}</td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                        {pathLabel(row.path)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs">{row.path}</td>
                    <td className="py-2.5 max-w-[260px] truncate text-xs text-white/50">
                      {formatReferrer(row.referrer)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-sm text-white/45">
              共 {pagination.total} 条 · 第 {pagination.page} / {pagination.totalPages} 页 · 每页{" "}
              {pagination.limit} 条
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
