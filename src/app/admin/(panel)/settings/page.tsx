"use client";

import { useEffect, useState } from "react";

export default function SettingsAdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [supportUrl, setSupportUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [supportMsg, setSupportMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setTitle(d?.homeSeoTitle ?? "");
        setDescription(d?.homeSeoDescription ?? "");
        setSupportUrl(d?.supportTelegramUrl ?? "");
      });
  }, []);

  async function saveSupport() {
    setSupportMsg("保存中...");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supportTelegramUrl: supportUrl.trim() || null }),
    });
    const data = await res.json().catch(() => ({}));
    setSupportMsg(
      res.ok
        ? "✅ 客服链接已保存，刷新前台即可看到可点击按钮"
        : `❌ ${data.error ?? "保存失败"}`,
    );
  }

  async function saveSeo() {
    setMsg("保存中...");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeSeoTitle: title, homeSeoDescription: description }),
    });
    setMsg(res.ok ? "✅ SEO 设置已保存" : "❌ 保存失败");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">站点设置</h1>
      <p className="mt-1 text-white/50">客服 WhatsApp、首页 SEO 等前台配置</p>

      <div className="mt-8 space-y-4 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 p-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h2 className="text-base font-semibold text-[#7ee8a3]">WhatsApp 客服（联系客服按钮）</h2>
        </div>
        <p className="text-sm text-white/50">
          填写后，前台购物袋右侧会显示「联系客服」按钮，点击跳转到你的 WhatsApp。可随时更换。
        </p>
        {supportMsg && <p className="text-sm text-amber-400">{supportMsg}</p>}
        <label className="block text-sm">
          <span className="text-white/70">WhatsApp 链接或手机号</span>
          <input
            value={supportUrl}
            onChange={(e) => setSupportUrl(e.target.value)}
            placeholder="https://wa.me/60123456789 或 +60 12-345 6789"
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
          <p className="mt-1.5 text-xs text-white/40">
            支持：wa.me 链接、api.whatsapp.com 链接、带国家码的手机号（也兼容 Telegram 链接）
          </p>
        </label>
        <button
          type="button"
          onClick={saveSupport}
          className="rounded-lg bg-[#25D366] px-6 py-2.5 text-sm font-bold text-white"
        >
          保存客服链接
        </button>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-sm font-semibold text-white/80">首页 SEO</h2>
        {msg && <p className="text-sm text-amber-400">{msg}</p>}
        <label className="block text-sm">
          <span className="text-white/70">首页 SEO 标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">首页 SEO 描述</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={saveSeo}
          className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black"
        >
          保存 SEO
        </button>
      </div>
    </div>
  );
}
