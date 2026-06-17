"use client";

import { useCallback, useEffect, useState } from "react";

type Stats = {
  users: number;
  payments: number;
  orders: number;
  draws: number;
  pendingPayments: number;
  winnersDemoMode: boolean;
};

export default function TestDataCleanup() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cleanup");
      const data = await res.json();
      if (res.ok) setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runCleanup() {
    if (!confirm) {
      setConfirm(true);
      setMsg("再次点击「确认清理」将删除下列测试数据（不可恢复）");
      return;
    }

    setCleaning(true);
    setMsg("清理中...");
    try {
      const res = await fetch("/api/admin/cleanup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "清理失败");
      setMsg(
        `✅ 已清理：${data.deleted.users} 个用户、${data.deleted.payments} 笔支付、${data.deleted.orders} 个订单、${data.deleted.draws} 次抽奖。前台假中奖动态已关闭。`,
      );
      setConfirm(false);
      await load();
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "清理失败"}`);
      setConfirm(false);
    } finally {
      setCleaning(false);
    }
  }

  const total =
    (stats?.users ?? 0) +
    (stats?.payments ?? 0) +
    (stats?.orders ?? 0) +
    (stats?.draws ?? 0);

  return (
    <div className="mt-10 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
      <h2 className="font-semibold text-red-300">清理测试数据</h2>
      <p className="mt-1 text-sm text-white/50">
        删除所有注册用户、支付记录、订单和抽奖记录，方便你自己注册账号重新测试。
        产品、盲盒奖品、收款二维码等配置会保留。
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-white/40">统计中...</p>
      ) : stats ? (
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <li className="rounded-lg bg-black/20 px-3 py-2">注册用户：{stats.users}</li>
          <li className="rounded-lg bg-black/20 px-3 py-2">
            支付记录：{stats.payments}
            {stats.pendingPayments > 0 && (
              <span className="ml-1 text-amber-400">（{stats.pendingPayments} 笔进行中）</span>
            )}
          </li>
          <li className="rounded-lg bg-black/20 px-3 py-2">订单：{stats.orders}</li>
          <li className="rounded-lg bg-black/20 px-3 py-2">抽奖记录：{stats.draws}</li>
          <li className="rounded-lg bg-black/20 px-3 py-2 sm:col-span-2">
            前台假中奖滚动：{stats.winnersDemoMode ? "开启（演示）" : "已关闭（仅真实数据）"}
          </li>
        </ul>
      ) : null}

      {msg && <p className="mt-4 text-sm text-amber-400">{msg}</p>}

      <button
        type="button"
        disabled={cleaning || loading || total === 0}
        onClick={runCleanup}
        className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
      >
        {cleaning ? "清理中..." : confirm ? "确认清理（不可恢复）" : "一键清理测试数据"}
      </button>

      {total === 0 && !loading && (
        <p className="mt-2 text-xs text-white/30">当前没有可清理的测试数据，可直接去前台注册账号测试。</p>
      )}
    </div>
  );
}
