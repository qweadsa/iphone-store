"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { getStatusLabel, ORDER_STATUSES } from "@/lib/orders";

type OrderItem = {
  id: number;
  productId: string;
  name: string;
  color: string;
  storage: string;
  price: number;
  quantity: number;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

const PAGE_SIZE = 30;

function isPlaceholderAddress(address: string): boolean {
  const value = address.trim();
  return !value || value === "—" || value === "-";
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setOrders(data);
      setTotalCount(data.length);
      setTotalPages(1);
    } else {
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalCount(typeof data.totalCount === "number" ? data.totalCount : 0);
      setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 1);
    }
    setLoading(false);
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: number, status: string) {
    setMsg("更新中...");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMsg(res.ok ? "" : "❌ 更新失败");
    if (res.ok) void load();
  }

  function handleSearch() {
    setSearchQuery(queryInput);
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">订单管理</h1>
      <p className="mt-1 text-white/50">查询客户订单、更新发货状态</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="搜索订单号 / 邮箱 / 姓名 / 电话"
          className="min-w-[240px] flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black"
        >
          查询
        </button>
      </div>

      {msg && <p className="mt-3 text-sm text-amber-400">{msg}</p>}

      {loading ? (
        <p className="mt-8 text-white/50">加载中...</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-white/50">暂无订单</p>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {orders.map((order) => {
              const needsAddress = isPlaceholderAddress(order.address);
              const isBlindbox = order.items.some((item) => item.productId === "blindbox-draw");
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/10 bg-white/5"
                >
                  <button
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                    className="flex w-full items-center gap-4 p-4 text-left"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-white/40">
                        {order.customerName} · {order.email} ·{" "}
                        {new Date(order.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-400">
                      {formatPrice(order.total)}
                    </span>
                    {needsAddress && isBlindbox && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium text-amber-300">
                        待填地址
                      </span>
                    )}
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-white/30">
                      {expanded === order.id ? "▲" : "▼"}
                    </span>
                  </button>

                  {expanded === order.id && (
                    <div className="border-t border-white/10 px-4 pb-4">
                      <div className="mt-3 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                        <p>电话：{order.phone || "—"}</p>
                        <p>
                          地址：
                          {needsAddress ? (
                            <span className="text-amber-300">客户尚未填写收货地址</span>
                          ) : (
                            <>
                              {order.address}, {order.city} {order.state} {order.zip}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
                          >
                            <span>
                              {item.name} · {item.storage} · {item.color} ×
                              {item.quantity}
                            </span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-white/50">更新状态：</span>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-sm text-white/45">
                共 {totalCount} 条 · 第 {page} / {totalPages} 页 · 每页 {PAGE_SIZE} 条
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  上一页
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
