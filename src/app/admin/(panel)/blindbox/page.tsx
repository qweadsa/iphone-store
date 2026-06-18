"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getPrizeRealOdds } from "@/lib/probability";

type Prize = {
  id: number;
  name: string;
  prizeType: string;
  subtitle: string | null;
  tier: string;
  fulfillmentType: string;
  weight: number;
  displayOdds: string | null;
  emoji: string;
  imageUrl: string | null;
  drawable: boolean;
  showInPool: boolean;
  active: boolean;
  sortOrder: number;
};

type Config = {
  price: number;
  enabled: boolean;
  grandPrizeName: string;
  grandPrizeValue: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  grandPrizeImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  dailyLimit: number;
  winnersDemoMode?: boolean;
};

const TIERS = [
  { value: "legendary", label: "传说 (Legendary)" },
  { value: "epic", label: "史诗 (Epic)" },
  { value: "rare", label: "稀有 (Rare)" },
  { value: "uncommon", label: "普通 (Uncommon)" },
];

const FULFILLMENTS = [
  { value: "grand", label: "终极大奖 (实物)" },
  { value: "credit", label: "商城抵扣" },
  { value: "case", label: "配件/实物" },
  { value: "coupon", label: "优惠券" },
  { value: "retry", label: "安慰奖/未中" },
  { value: "none", label: "仅展示 (不参与发奖逻辑)" },
];

function emptyPrize(sortOrder: number): Omit<Prize, "id"> {
  return {
    name: "",
    prizeType: "",
    subtitle: "",
    tier: "epic",
    fulfillmentType: "case",
    weight: 1,
    displayOdds: null,
    emoji: "🎁",
    imageUrl: null,
    drawable: true,
    showInPool: true,
    active: true,
    sortOrder,
  };
}

function willShowOnFrontend(prize: Prize): boolean {
  return prize.active && prize.showInPool && prize.fulfillmentType !== "retry";
}

function normalizePrizeForSave(prize: Prize): Prize {
  return {
    ...prize,
    showInPool: prize.fulfillmentType === "retry" ? false : true,
    active: prize.active || prize.fulfillmentType !== "retry",
  };
}

function normalizePrize(raw: Record<string, unknown>): Prize {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    prizeType: String(raw.prizeType ?? raw.prize_type ?? ""),
    subtitle: (raw.subtitle as string | null) ?? null,
    tier: String(raw.tier ?? "rare"),
    fulfillmentType: String(raw.fulfillmentType ?? raw.fulfillment_type ?? "none"),
    weight: Number(raw.weight) || 0,
    displayOdds: (raw.displayOdds as string | null) ?? (raw.display_odds as string | null) ?? null,
    emoji: String(raw.emoji ?? "🎁"),
    imageUrl: (raw.imageUrl as string | null) ?? (raw.image_url as string | null) ?? null,
    drawable: raw.drawable !== false && raw.drawable !== 0,
    showInPool: raw.showInPool !== false && raw.show_in_pool !== false && raw.show_in_pool !== 0,
    active: raw.active !== false && raw.active !== 0,
    sortOrder: Number(raw.sortOrder ?? raw.sort_order) || 0,
  };
  if (prize.fulfillmentType !== "retry") {
    prize.showInPool = true;
  }
  return prize;
}

export default function BlindBoxAdminPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [frontendPoolCount, setFrontendPoolCount] = useState<number | null>(null);
  const saveTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const prizesRef = useRef<Prize[]>([]);

  const reload = useCallback(() => {
    return Promise.all([
      fetch("/api/admin/blindbox").then((r) => r.json().then((d) => ({ ok: r.ok, d }))),
      fetch("/api/blindbox/prizes", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => (typeof d.poolCount === "number" ? d.poolCount : null))
        .catch(() => null),
    ]).then(([{ ok, d }, poolCount]) => {
      if (!ok) {
        setMsg(`❌ 加载失败：${d.error || "请重新登录后台"}`);
        return;
      }
      setConfig(d.config);
      setPrizes((d.prizes ?? []).map((p: Record<string, unknown>) => normalizePrize(p)));
      setFrontendPoolCount(poolCount);
    });
  }, []);

  useEffect(() => {
    prizesRef.current = prizes;
  }, [prizes]);

  useEffect(() => {
    return () => {
      for (const timer of saveTimersRef.current.values()) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  async function saveConfig() {
    if (!config) return;
    setMsg("保存中...");
    const res = await fetch("/api/admin/blindbox", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setMsg(res.ok ? "✅ 盲盒设置已保存" : `❌ ${data.error || "保存失败"}`);
  }

  async function savePrize(prize: Prize, opts?: { quiet?: boolean }) {
    if (!prize.name.trim()) {
      if (!opts?.quiet) setMsg("❌ 请填写礼品名称");
      return false;
    }
    if (!prize.prizeType?.trim()) {
      if (!opts?.quiet) setMsg("❌ 奖品数据不完整，请刷新页面后重试");
      return false;
    }
    const payload = normalizePrizeForSave(prize);
    if (!opts?.quiet) setMsg("保存中...");
    const res = await fetch(`/api/admin/blindbox/prizes/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      if (!opts?.quiet) setMsg("✅ 礼品已保存，首页奖池已更新");
      setPrizes((prev) =>
        prev.map((p) => (p.id === payload.id ? { ...p, ...payload } : p)),
      );
      await reload();
      return true;
    }
    if (!opts?.quiet) setMsg(`❌ ${data.error || "保存失败"}`);
    return false;
  }

  function scheduleAutoSave(prizeId: number) {
    const existing = saveTimersRef.current.get(prizeId);
    if (existing) clearTimeout(existing);
    saveTimersRef.current.set(
      prizeId,
      setTimeout(() => {
        const latest = prizesRef.current.find((p) => p.id === prizeId);
        if (!latest) return;
        void savePrize(latest, { quiet: true }).then((ok) => {
          if (ok) setMsg("✅ 已自动保存并同步到首页");
        });
      }, 900),
    );
  }

  async function saveAllPrizes() {
    if (prizes.length === 0) return;
    setMsg("保存全部礼品中...");
    const results = await Promise.all(
      prizes.map((prize) => {
        if (!prize.name.trim() || !prize.prizeType?.trim()) {
          return Promise.resolve(new Response(null, { status: 400 }));
        }
        return fetch(`/api/admin/blindbox/prizes/${prize.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizePrizeForSave(prize)),
        });
      }),
    );
    const failed = results.filter((r) => !r.ok).length;
    if (failed === 0) {
      setMsg("✅ 全部礼品已保存，首页奖池将立即更新");
      await reload();
    } else {
      setMsg(`❌ ${failed} 个礼品保存失败，请检查名称后逐个点「保存此礼品」`);
    }
  }

  async function savePrizeImage(idx: number, url: string | null) {
    const payload = normalizePrizeForSave({ ...prizes[idx], imageUrl: url });
    updatePrize(idx, {
      imageUrl: url,
      showInPool: payload.showInPool,
      active: payload.active,
    });
    await savePrize(payload);
  }

  async function addPrize() {
    setMsg("添加中...");
    const res = await fetch("/api/admin/blindbox/prizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...emptyPrize(prizes.length + 1),
        name: "新礼品",
        subtitle: "Premium Tech Prize",
        drawable: true,
        weight: 1,
        tier: "epic",
        fulfillmentType: "case",
      }),
    });
    if (res.ok) {
      setMsg("✅ 已添加新礼品，修改后会自动保存到首页");
      await reload();
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setMsg(`❌ 添加失败：${data.error || res.status}`);
    }
  }

  async function deletePrize(id: number, name: string) {
    if (!confirm(`确定删除「${name}」？此操作不可撤销。`)) return;
    setMsg("删除中...");
    const res = await fetch(`/api/admin/blindbox/prizes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("✅ 已删除");
      await reload();
    } else {
      setMsg("❌ 删除失败");
    }
  }

  function updatePrize(idx: number, patch: Partial<Prize>) {
    setPrizes((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      scheduleAutoSave(next[idx].id);
      return next;
    });
  }

  async function movePrize(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= prizes.length) return;
    const next = [...prizes];
    [next[idx], next[target]] = [next[target], next[idx]];
    next.forEach((p, i) => {
      p.sortOrder = i + 1;
    });
    setPrizes(next);
    setMsg("保存排序...");
    await Promise.all(
      next.map((p) =>
        fetch(`/api/admin/blindbox/prizes/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizePrizeForSave(p)),
        }),
      ),
    );
    setMsg("✅ 排序已更新");
  }

  if (loading) return <p className="text-white/50">加载中...</p>;

  const drawWeight = prizes
    .filter((p) => p.active && p.drawable && p.weight > 0)
    .reduce((s, p) => s + p.weight, 0);
  const localPoolCount = prizes.filter(willShowOnFrontend).length;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">盲盒管理</h1>
      <p className="mt-1 text-white/50">
        管理所有高端礼品：iPhone、电脑、显卡、耳机、相机等。修改后会自动保存并同步到首页奖池和开箱滚轴。
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
          本页将显示 {localPoolCount} 个礼品
        </span>
        {frontendPoolCount != null && (
          <span
            className={`rounded-lg border px-3 py-1.5 ${
              frontendPoolCount === localPoolCount
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            首页实际读取 {frontendPoolCount} 个
            {frontendPoolCount !== localPoolCount ? "（请点保存全部或等待自动保存）" : ""}
          </span>
        )}
        <a
          href="/#prizes"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline"
        >
          打开首页奖池预览 ↗
        </a>
      </div>
      {msg && <p className="mt-4 text-sm text-amber-400">{msg}</p>}

      {config && (
        <section className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold">盲盒设置</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-white/70">抽奖价格 (USD)</span>
              <input
                type="number"
                value={config.price}
                onChange={(e) => setConfig({ ...config, price: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/70">终极大奖名称</span>
              <input
                value={config.grandPrizeName}
                onChange={(e) => setConfig({ ...config, grandPrizeName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-white/70">大奖价值</span>
              <input
                value={config.grandPrizeValue}
                onChange={(e) => setConfig({ ...config, grandPrizeValue: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              />
              <span className="text-white/70">启用盲盒活动</span>
            </label>
            <label className="block text-sm">
              <span className="text-white/70">每日全站抽奖上限（0 = 不限）</span>
              <input
                type="number"
                min={0}
                value={config.dailyLimit ?? 0}
                onChange={(e) => setConfig({ ...config, dailyLimit: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.winnersDemoMode ?? true}
                onChange={(e) => setConfig({ ...config, winnersDemoMode: e.target.checked })}
              />
              <span className="text-white/70">前台中奖动态演示模式</span>
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-white/70">首页标题</span>
            <input
              value={config.heroTitle ?? ""}
              onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/70">首页副标题</span>
            <textarea
              value={config.heroSubtitle ?? ""}
              onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            />
          </label>
          <ImageUpload
            label="首页主图（右侧大奖展示图）"
            hint="建议 512×512 以上。上传成功后务必点「保存盲盒设置」。"
            value={config.grandPrizeImageUrl ?? ""}
            onChange={(url) => setConfig({ ...config, grandPrizeImageUrl: url || null })}
          />
          <button
            onClick={saveConfig}
            className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black"
          >
            保存盲盒设置
          </button>
        </section>
      )}

      <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">礼品库 ({prizes.length})</h2>
            <p className="mt-1 text-xs text-white/40">
              修改后会自动保存并同步到首页（约 1 秒）。前台显示需勾选：启用 + 显示在奖池；发奖类型勿选「安慰奖/未中」。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveAllPrizes}
              disabled={prizes.length === 0}
              className="rounded-lg border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/10 disabled:opacity-40"
            >
              保存全部礼品
            </button>
            <button
              onClick={addPrize}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black"
            >
              + 添加礼品
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-5">
          {prizes.map((prize, idx) => {
            const realOdds = getPrizeRealOdds(prize, drawWeight);
            const displayLabel = prize.displayOdds?.trim() || realOdds;
            return (
              <div key={prize.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
                  <span className="text-xs text-white/40">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => movePrize(idx, -1)}
                    disabled={idx === 0}
                    className="rounded bg-white/10 px-2 py-0.5 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => movePrize(idx, 1)}
                    disabled={idx === prizes.length - 1}
                    className="rounded bg-white/10 px-2 py-0.5 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <span className="ml-auto text-right text-xs font-medium text-amber-400">
                    前台 {displayLabel}
                    <span className="mt-0.5 block text-[10px] text-white/40">真实抽奖 {realOdds}</span>
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        willShowOnFrontend(prize) ? "text-emerald-400/90" : "text-red-300/90"
                      }`}
                    >
                      {willShowOnFrontend(prize) ? "✓ 会显示在首页奖池" : "✗ 不会显示在首页奖池"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => deletePrize(prize.id, prize.name)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    删除
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-white/70">礼品名称 *</span>
                    <input
                      value={prize.name}
                      onChange={(e) => updatePrize(idx, { name: e.target.value })}
                      placeholder="iPhone 17 Pro Max / RTX 4090 / Sony A7 IV"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm sm:col-span-2">
                    <span className="text-white/70">副标题（滚轴卡片下方小字）</span>
                    <input
                      value={prize.subtitle ?? ""}
                      onChange={(e) => updatePrize(idx, { subtitle: e.target.value })}
                      placeholder="1TB · Titanium / Flagship GPU"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-white/70">稀有度</span>
                    <select
                      value={prize.tier}
                      onChange={(e) => updatePrize(idx, { tier: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      {TIERS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-white/70">发奖类型</span>
                    <select
                      value={prize.fulfillmentType}
                      onChange={(e) => {
                        const fulfillmentType = e.target.value;
                        if (fulfillmentType === "retry") {
                          updatePrize(idx, { fulfillmentType, showInPool: false });
                        } else {
                          updatePrize(idx, {
                            fulfillmentType,
                            showInPool: true,
                            active: true,
                          });
                        }
                      }}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      {FULFILLMENTS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    {prize.fulfillmentType === "retry" && (
                      <p className="mt-2 text-xs font-medium text-red-300">
                        「安慰奖/未中」不会出现在首页奖池和抽奖滚轴，仅参与后台抽奖权重。
                      </p>
                    )}
                    {prize.fulfillmentType !== "retry" && prize.fulfillmentType !== "none" && (
                      <p className="mt-2 text-xs text-white/45">
                        配件/实物、优惠券等会显示在首页奖池（已自动勾选「显示在奖池」）。
                      </p>
                    )}
                  </label>

                  <div className="sm:col-span-2 space-y-3">
                    <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4">
                      <p className="text-xs font-semibold text-red-300">
                        ① 真实抽奖（仅系统计算，用户看不到）
                      </p>
                      <label className="mt-3 block text-sm">
                        <span className="text-white/70">真实抽奖权重</span>
                        <input
                          type="number"
                          min={0}
                          value={prize.weight}
                          onChange={(e) => updatePrize(idx, { weight: Number(e.target.value) })}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                        />
                        <p className="mt-1.5 text-[11px] text-red-200/70">
                          真实中奖概率：<strong>{realOdds}</strong>
                          <span className="text-white/40">
                            {" "}
                            — 权重越小越难中。例：iPhone 权重 1、总权重 1000 ≈ 0.1%
                          </span>
                        </p>
                      </label>
                    </div>

                    <div className="rounded-xl border border-[#FFB800]/35 bg-[#FFB800]/5 p-4">
                      <p className="text-xs font-semibold text-[#FFB800]">
                        ② 前台展示（用户看到的概率，不影响真实抽奖）
                      </p>
                      <label className="mt-3 block text-sm">
                        <span className="text-white/70">展示概率文字</span>
                        <input
                          value={prize.displayOdds ?? ""}
                          onChange={(e) =>
                            updatePrize(idx, { displayOdds: e.target.value.trim() || null })
                          }
                          placeholder="例如 0.8%、高概率、Limited"
                          className="mt-1 w-full rounded-lg border border-[#FFB800]/40 bg-black/20 px-3 py-2"
                        />
                        <p className="mt-1.5 text-[11px] text-[#FFB800]/80">
                          前台奖池显示：<strong>{displayLabel}</strong>
                          <span className="text-white/40">
                            {" "}
                            — 留空则自动按真实权重算（不建议大奖留空）
                          </span>
                        </p>
                      </label>
                    </div>
                  </div>

                  <label className="block text-sm">
                    <span className="text-white/70">Emoji 备用</span>
                    <input
                      value={prize.emoji}
                      onChange={(e) => updatePrize(idx, { emoji: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center"
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prize.drawable}
                      onChange={(e) => updatePrize(idx, { drawable: e.target.checked })}
                    />
                    <span className="text-white/70">参与抽奖</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                      prize.fulfillmentType !== "retry" || prize.showInPool
                        ? ""
                        : "border border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={prize.fulfillmentType !== "retry" ? true : prize.showInPool}
                      disabled={prize.fulfillmentType !== "retry"}
                      onChange={(e) => updatePrize(idx, { showInPool: e.target.checked })}
                    />
                    <span
                      className={
                        prize.fulfillmentType !== "retry" || prize.showInPool
                          ? "text-white/70"
                          : "font-semibold text-red-300"
                      }
                    >
                      显示在奖池（前台必勾）
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prize.active}
                      onChange={(e) => updatePrize(idx, { active: e.target.checked })}
                    />
                    <span className="text-white/70">启用</span>
                  </label>
                </div>
                {prize.fulfillmentType === "retry" && !prize.showInPool && (
                  <p className="mt-2 text-xs font-medium text-red-300">
                    ⚠ 安慰奖默认不显示在首页奖池（仅参与抽奖权重）。
                  </p>
                )}
                {prize.fulfillmentType !== "retry" && (
                  <p className="mt-2 text-xs text-emerald-400/80">
                    非安慰奖礼品保存后会自动显示在首页奖池。
                  </p>
                )}

                <div className="mt-3">
                  <ImageUpload
                    label="礼品展示图（PNG/JPG，用于奖池 + 开箱滚轴）"
                    hint="默认保留原图。白色耳机等可取消「自动去除白底」或勾选后上传；系统会铺白底避免变黑。"
                    enableCutout
                    defaultCutout={false}
                    value={prize.imageUrl ?? ""}
                    onChange={(url) => void savePrizeImage(idx, url || null)}
                  />
                </div>

                <button
                  onClick={() => savePrize(prizes[idx])}
                  className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                >
                  保存此礼品
                </button>
              </div>
            );
          })}
        </div>

        {prizes.length === 0 && (
          <p className="mt-6 text-center text-sm text-white/40">
            暂无礼品，点击「添加礼品」开始配置
          </p>
        )}
      </section>
    </div>
  );
}
