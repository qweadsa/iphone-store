"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHECKOUT_METHODS } from "@/lib/payments/methods";
import { formatAdminPrice } from "@/lib/market";

type QrStatus = {
  method: string;
  label: string;
  url: string | null;
  uploaded: boolean;
};

type PaymentRow = {
  paymentId: string;
  amount: number;
  status: string;
  purpose: string;
  method: string;
  email: string | null;
  userName: string | null;
  createdAt: string;
  drawn: boolean;
};

const PURPOSE_LABEL: Record<string, string> = {
  blindbox: "盲盒抽奖",
  order: "商城订单",
  cart: "购物车",
  recharge: "账户充值",
};

type ActivePayment = {
  paymentId: string;
  amount: number;
  status: string;
  purpose: string;
  email: string | null;
  userName: string | null;
  userId: number | null;
  createdAt: string;
};

function PayerBadge({ row }: { row: { email: string | null; userName: string | null } }) {
  const isMember = !!row.userName;
  const hasEmail = !!row.email;

  if (isMember) {
    return (
      <span className="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
        已登录用户
      </span>
    );
  }
  if (hasEmail) {
    return (
      <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
        游客
      </span>
    );
  }
  return (
    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
      未留邮箱
    </span>
  );
}

function PayerEmail({ row }: { row: { email: string | null; userName: string | null } }) {
  if (!row.email) {
    return <p className="mt-1 text-sm text-amber-400">等待用户填写邮箱…</p>;
  }

  return (
    <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-400/80">
        付款邮箱
      </p>
      <p className="mt-0.5 break-all font-mono text-sm font-semibold text-emerald-200">
        {row.email}
      </p>
      {row.userName && (
        <p className="mt-1 text-xs text-white/45">用户昵称：{row.userName}</p>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pending: "正在付款",
  completed: "已确认收款",
  cancelled: "用户已取消",
};

export default function ReceiveSettingsPage() {
  const [paypalMe, setPaypalMe] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [receiveLink, setReceiveLink] = useState("");
  const [receiveNote, setReceiveNote] = useState("");
  const [requireAdminConfirm, setRequireAdminConfirm] = useState(true);
  const [qrs, setQrs] = useState<QrStatus[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [activePaying, setActivePaying] = useState<ActivePayment[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [listLimit, setListLimit] = useState(30);
  const [statusFilter, setStatusFilter] = useState("all");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const loadPayments = useCallback(async () => {
    const res = await fetch(`/api/admin/payments/orders?status=${statusFilter}&limit=${listLimit}`);
    const data = await res.json();
    if (data.payments) setPayments(data.payments);
    if (data.active) setActivePaying(data.active);
    if (typeof data.pendingCount === "number") setPendingCount(data.pendingCount);
    if (typeof data.totalCount === "number") setTotalCount(data.totalCount);
  }, [statusFilter, listLimit]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setPaypalMe(d?.paypalMe ?? "");
        setPaypalEmail(d?.paypalEmail ?? "");
        setReceiveLink(d?.receiveLink ?? "");
        setReceiveNote(d?.receiveNote ?? "");
        setRequireAdminConfirm(d?.paymentRequireAdminConfirm !== false);
      });
    loadQrs();
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    const timer = window.setInterval(loadPayments, 3000);
    return () => window.clearInterval(timer);
  }, [loadPayments]);

  async function clearFinishedPayments() {
    if (
      !confirm(
        "确定清除所有「已确认收款」和「用户已取消」的记录吗？\n正在付款中的记录会保留。",
      )
    ) {
      return;
    }
    setClearing(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/payments/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "completed_cancelled" }),
      });
      const data = (await res.json().catch(() => ({}))) as { deleted?: number; error?: string };
      if (!res.ok) throw new Error(data.error || "清除失败");
      setMsg(`✅ 已清除 ${data.deleted ?? 0} 条历史付款记录`);
      await loadPayments();
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "清除失败"}`);
    } finally {
      setClearing(false);
    }
  }

  async function cancelPayment(paymentId: string) {
    setCancelling(paymentId);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取消失败");
      setMsg(`已标记取消 ${paymentId}`);
      await loadPayments();
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "取消失败"}`);
    } finally {
      setCancelling(null);
    }
  }

  async function loadQrs() {
    const res = await fetch("/api/admin/payments/qr");
    const data = await res.json();
    if (data.qrs) setQrs(data.qrs);
  }

  async function save() {
    setMsg("保存中...");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paypalMe,
        paypalEmail,
        receiveLink,
        receiveNote,
        paymentRequireAdminConfirm: requireAdminConfirm,
      }),
    });
    setMsg(res.ok ? "✅ 设置已保存" : "❌ 保存失败");
  }

  async function confirmPayment(paymentId: string) {
    setConfirming(paymentId);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "确认失败");
      setMsg(`✅ 已确认收款 ${paymentId}`);
      await loadPayments();
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "确认失败"}`);
    } finally {
      setConfirming(null);
    }
  }

  async function uploadQr(method: string, file: File) {
    setUploading(method);
    setMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("method", method);
      const res = await fetch("/api/admin/payments/qr", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setMsg(`✅ ${method} 收款二维码已更新`);
      await loadQrs();
    } catch (e) {
      setMsg(`❌ ${e instanceof Error ? e.message : "上传失败"}`);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">收款 & 支付监控</h1>
      <p className="mt-1 text-white/50">
        用户一点付款就会出现在下方；取消则自动标记，到账后你点「确认已收款」即可
      </p>
      {msg && <p className="mt-4 text-sm text-amber-400">{msg}</p>}

      <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
          </span>
          <h2 className="font-semibold">
            正在付款
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-400">({pendingCount} 人)</span>
            )}
          </h2>
          <span className="ml-auto text-xs text-white/30">每 3 秒自动刷新</span>
        </div>

        <div className="mt-4 space-y-3">
          {activePaying.length === 0 && (
            <p className="rounded-lg border border-white/10 bg-black/20 p-8 text-center text-sm text-white/40">
              当前没有用户正在付款
            </p>
          )}
          {activePaying.map((row) => (
            <div
              key={row.paymentId}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-amber-500/20 bg-black/30 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-400/80">正在付款中…</p>
                <p className="font-mono text-base font-bold text-amber-300">{row.paymentId}</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatAdminPrice(row.amount)} · {PURPOSE_LABEL[row.purpose] ?? row.purpose}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/40">
                  <PayerBadge row={row} />
                  <span>开始于 {new Date(row.createdAt).toLocaleTimeString()}</span>
                </div>
                <PayerEmail row={row} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={confirming === row.paymentId}
                  onClick={() => confirmPayment(row.paymentId)}
                  className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
                >
                  {confirming === row.paymentId ? "确认中..." : "✓ 确认已收款"}
                </button>
                <button
                  type="button"
                  disabled={cancelling === row.paymentId}
                  onClick={() => cancelPayment(row.paymentId)}
                  className="rounded-lg border border-white/20 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 disabled:opacity-50"
                >
                  {cancelling === row.paymentId ? "处理中..." : "标记取消"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">付款记录</h2>
            <p className="mt-1 text-xs text-white/40">
              共 {totalCount.toLocaleString()} 条 · 仅显示最近 {listLimit} 条
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={String(listLimit)}
              onChange={(e) => setListLimit(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="20">显示 20 条</option>
              <option value="30">显示 30 条</option>
              <option value="50">显示 50 条</option>
              <option value="100">显示 100 条</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="all">全部记录</option>
              <option value="completed">已确认收款</option>
              <option value="cancelled">用户已取消</option>
              <option value="pending">正在付款</option>
            </select>
            <button
              type="button"
              disabled={clearing}
              onClick={() => void clearFinishedPayments()}
              className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              {clearing ? "清除中..." : "清除已完成记录"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {payments.length === 0 && (
            <p className="rounded-lg border border-white/10 bg-black/20 p-6 text-center text-sm text-white/40">
              暂无记录
            </p>
          )}
          {payments.map((row) => (
            <div
              key={row.paymentId}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-bold text-white/80">{row.paymentId}</p>
                <p className="mt-1 text-sm">
                  {formatAdminPrice(row.amount)} · {PURPOSE_LABEL[row.purpose] ?? row.purpose}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/40">
                  <PayerBadge row={row} />
                  <span>{new Date(row.createdAt).toLocaleString()}</span>
                </div>
                {row.email ? (
                  <p className="mt-1 font-mono text-sm text-emerald-300/90">{row.email}</p>
                ) : (
                  <p className="mt-1 text-xs text-amber-400/80">未留邮箱</p>
                )}
                {row.userName && (
                  <p className="mt-0.5 text-xs text-white/40">用户：{row.userName}</p>
                )}
                {row.purpose === "blindbox" && row.drawn && (
                  <p className="mt-1 text-xs text-green-400/80">已抽奖</p>
                )}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  row.status === "completed"
                    ? "bg-green-500/15 text-green-400"
                    : row.status === "cancelled"
                      ? "bg-white/10 text-white/40"
                      : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {STATUS_LABEL[row.status] ?? row.status}
              </span>
              {row.status === "pending" && (
                <button
                  type="button"
                  disabled={confirming === row.paymentId}
                  onClick={() => confirmPayment(row.paymentId)}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
                >
                  确认已收款
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={requireAdminConfirm}
            onChange={(e) => setRequireAdminConfirm(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">需要后台确认后才能抽奖（推荐）</span>
            <span className="mt-1 block text-xs text-white/40">
              开启后，用户扫码付款后不能自己点「已转账」，必须等你在上方确认收款；关闭则用户可自行确认（仅适合测试）
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold">收款二维码（上传后前台立即生效）</h2>
        <p className="mt-1 text-xs text-white/40">
          建议上传 260×260 以上的 PNG 二维码图片
        </p>
        <div className="mt-5 space-y-4">
          {CHECKOUT_METHODS.map((m) => {
            const status = qrs.find((q) => q.method === m.id);
            return (
              <QrUploadRow
                key={m.id}
                label={m.label}
                method={m.id}
                url={status?.url}
                uploaded={status?.uploaded}
                uploading={uploading === m.id}
                onUpload={(file) => uploadQr(m.id, file)}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold">收款账户（可选）</h2>
        <p className="text-xs text-white/40">
          马来西亚站点主要使用上方二维码收款；以下链接字段为备用，一般无需填写。
        </p>

        <label className="block text-sm">
          <span className="text-white/70">通用收款链接（备用）</span>
          <input
            value={receiveLink}
            onChange={(e) => setReceiveLink(e.target.value)}
            placeholder="可选：第三方支付链接"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">PayPal.me（备用，非马来主流）</span>
          <input
            value={paypalMe}
            onChange={(e) => setPaypalMe(e.target.value)}
            placeholder="yourname"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">PayPal 邮箱（备用）</span>
          <input
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-white/70">收款备注（显示给客户）</span>
          <textarea
            value={receiveNote}
            onChange={(e) => setReceiveNote(e.target.value)}
            rows={2}
            placeholder="例如：扫码付款后请等待商家确认"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>

        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black"
        >
          保存全部设置
        </button>
      </div>
    </div>
  );
}

function QrUploadRow({
  label,
  method,
  url,
  uploaded,
  uploading,
  onUpload,
}: {
  label: string;
  method: string;
  url?: string | null;
  uploaded?: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {url ? (
          <Image src={url} alt={label} fill className="object-contain p-1" unoptimized />
        ) : (
          <span className="text-2xl text-white/20">QR</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-xs text-white/40">
          {uploaded ? "已上传 · 前台使用中" : "未上传 · 前台显示自动生成的占位码"}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-white/30">
          {url ?? `/payments/qr-${method}.*`}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-amber-500/50 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
      >
        {uploading ? "上传中..." : uploaded ? "更换" : "上传二维码"}
      </button>
    </div>
  );
}
