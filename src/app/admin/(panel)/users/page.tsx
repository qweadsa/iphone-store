"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";

type UserRow = {
  id: number;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
  paymentCount: number;
  drawCount: number;
};

const PAGE_SIZE = 30;

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(Array.isArray(data.users) ? data.users : []);
    setTotalCount(typeof data.totalCount === "number" ? data.totalCount : 0);
    setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 1);
    setLoading(false);
  }, [searchQuery, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSearch() {
    setSearchQuery(queryInput);
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">注册用户</h1>
      <p className="mt-1 text-white/50">
        共 {totalCount} 位用户 · 查看邮箱、昵称、钱包余额与注册时间
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="搜索邮箱 / 昵称"
          className="min-w-[240px] flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black"
        >
          查询
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-white/50">加载中...</p>
      ) : users.length === 0 ? (
        <p className="mt-8 text-white/50">暂无注册用户</p>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-white/50">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">昵称</th>
                  <th className="px-4 py-3 font-medium">邮箱</th>
                  <th className="px-4 py-3 font-medium">钱包余额</th>
                  <th className="px-4 py-3 font-medium">付款次数</th>
                  <th className="px-4 py-3 font-medium">抽奖次数</th>
                  <th className="px-4 py-3 font-medium">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/40">#{user.id}</td>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-white/70">{user.email}</td>
                    <td className="px-4 py-3 text-amber-400">{formatPrice(user.balance)}</td>
                    <td className="px-4 py-3 text-white/60">{user.paymentCount}</td>
                    <td className="px-4 py-3 text-white/60">{user.drawCount}</td>
                    <td className="px-4 py-3 text-white/50">
                      {new Date(user.createdAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-sm text-white/45">
                共 {totalCount} 位 · 第 {page} / {totalPages} 页 · 每页 {PAGE_SIZE} 条
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
