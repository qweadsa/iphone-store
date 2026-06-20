"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeroShowcaseEditor from "@/components/admin/HeroShowcaseEditor";
import ImageUpload from "@/components/admin/ImageUpload";
import { getPrizeRealOdds } from "@/lib/probability";
import { displayPrizeName } from "@/lib/prize-display";
import { formatAdminPrice } from "@/lib/market";
import { parseHeroShowcaseJson, serializeHeroShowcase, type HeroShowcaseEntry } from "@/lib/hero-showcase";

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
  heroShowcase: HeroShowcaseEntry[];
  seoTitle: string | null;
  seoDescription: string | null;
  dailyLimit: number;
  winnersDemoMode?: boolean;
  statsDemoMode?: boolean;
  displayPlayersToday?: number;
  displayWinnersToday?: number;
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
  { value: "none", label: "仅展示（仍显示奖池，不参与发奖）" },
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
  const prize: Prize = {
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

function poolPositionById(prizes: Prize[]): Map<number, number> {
  const map = new Map<number, number>();
  let pos = 0;
  for (const prize of [...prizes].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (!willShowOnFrontend(prize)) continue;
    pos += 1;
    map.set(prize.id, pos);
  }
  return map;
}

export default function BlindBoxAdminPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [frontendPoolCount, setFrontendPoolCount] = useState<number | null>(null);
  const [realStatsToday, setRealStatsToday] = useState<{
    playersToday: number;
    winnersToday: number;
  } | null>(null);
  const saveTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const prizesRef = useRef<Prize[]>([]);
  const prizeCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());

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
      setConfig({
        ...d.config,
        heroShowcase: parseHeroShowcaseJson(d.config?.heroShowcaseJson),
        statsDemoMode: d.config?.statsDemoMode !== false,
        displayPlayersToday: d.config?.displayPlayersToday ?? 128,
        displayWinnersToday: d.config?.displayWinnersToday ?? 42,
      });
      setPrizes((d.prizes ?? []).map((p: Record<string, unknown>) => normalizePrize(p)));
      setFrontendPoolCount(poolCount);
      if (d.realStatsToday) {
        setRealStatsToday({
          playersToday: d.realStatsToday.playersToday ?? 0,
          winnersToday: d.realStatsToday.winnersToday ?? 0,
        });
      }
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
    const { heroShowcase, ...rest } = config;
    const res = await fetch("/api/admin/blindbox", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rest,
        heroShowcaseJson: serializeHeroShowcase(heroShowcase),
        grandPrizeImageUrl:
          rest.grandPrizeImageUrl?.trim() ||
          heroShowcase.find((frame) => frame.src.trim())?.src ||
          null,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setMsg(res.ok ? "✅ 盲盒设置已保存" : `❌ ${data.error || "保存失败"}`);
    if (res.ok) await reload();
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
          if (ok) {
            setMsg("✅ 已自动保存并同步到首页");
            void fetch("/api/blindbox/prizes", { cache: "no-store" })
              .then((r) => r.json())
              .then((d) => {
                if (typeof d.poolCount === "number") setFrontendPoolCount(d.poolCount);
              })
              .catch(() => undefined);
          } else {
            setMsg("❌ 自动保存失败，请点「保存此礼品」或检查礼品名称");
          }
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
      const created = (await res.json()) as { id?: number };
      setMsg("✅ 已添加新礼品，请填写名称后保存");
      await reload();
      if (created.id != null) {
        setExpandedIds(new Set([created.id]));
        requestAnimationFrame(() => {
          prizeCardRefs.current.get(created.id!)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setMsg(`❌ 添加失败：${data.error || res.status}`);
    }
  }

  function togglePrizeExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
  const poolPositions = poolPositionById(prizes);

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold md:text-2xl">盲盒管理</h1>
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
        <section className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
          <h2 className="font-semibold">盲盒设置</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-white/70">抽奖价格（马币 RM）</span>
              <input
                type="number"
                value={config.price}
                onChange={(e) => setConfig({ ...config, price: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              />
              <span className="mt-1 block text-xs text-white/35">
                前台显示为 {formatAdminPrice(config.price)}
              </span>
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

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <h3 className="text-sm font-semibold text-amber-200">首页数据卡片（今日玩家 / 今日中奖）</h3>
            <p className="mt-1 text-xs text-white/50">
              前台显示 = 下方「基础数值」+ 今日真实数据（有人付款成功 +1 玩家，有人抽中非安慰奖 +1 中奖）。
              取消勾选「叠加基础数值」则只显示真实数据。
            </p>
            {realStatsToday && (
              <p className="mt-2 text-xs text-white/45">
                今日真实：{realStatsToday.playersToday} 笔盲盒付款 · {realStatsToday.winnersToday} 次中奖
                {config.statsDemoMode !== false && (
                  <>
                    {" "}
                    → 前台约{" "}
                    {(config.displayPlayersToday ?? 0) + realStatsToday.playersToday} 玩家 /{" "}
                    {(config.displayWinnersToday ?? 0) + realStatsToday.winnersToday} 中奖
                  </>
                )}
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-white/70">基础 · 今日玩家</span>
                <input
                  type="number"
                  min={0}
                  value={config.displayPlayersToday ?? 0}
                  onChange={(e) =>
                    setConfig({ ...config, displayPlayersToday: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-white/70">基础 · 今日中奖</span>
                <input
                  type="number"
                  min={0}
                  value={config.displayWinnersToday ?? 0}
                  onChange={(e) =>
                    setConfig({ ...config, displayWinnersToday: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={config.statsDemoMode !== false}
                  onChange={(e) => setConfig({ ...config, statsDemoMode: e.target.checked })}
                />
                <span className="text-white/70">叠加基础数值（推荐开启，真实付款会自动往上加）</span>
              </label>
            </div>
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
          <HeroShowcaseEditor
            value={config.heroShowcase ?? []}
            onChange={(heroShowcase) => setConfig({ ...config, heroShowcase })}
          />
          <button
            onClick={saveConfig}
            className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black"
          >
            保存盲盒设置
          </button>
        </section>
      )}

      <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">礼品库 ({prizes.length})</h2>
            <p className="mt-1 text-xs text-white/40">
              点击礼品卡片展开编辑。需勾选「启用」且非安慰奖才会显示在首页奖池。
            </p>
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
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
          <div className="flex w-full flex-wrap gap-2 sm:hidden">
            <button
              onClick={saveAllPrizes}
              disabled={prizes.length === 0}
              className="flex-1 rounded-lg border border-amber-500/50 py-2 text-sm font-medium text-amber-300 disabled:opacity-40"
            >
              保存全部
            </button>
            <button
              onClick={addPrize}
              className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-bold text-black"
            >
              + 添加礼品
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {prizes.map((prize, idx) => {
            const realOdds = getPrizeRealOdds(prize, drawWeight);
            const displayLabel = prize.displayOdds?.trim() || realOdds;
            const expanded = expandedIds.has(prize.id);
            const poolVisible = willShowOnFrontend(prize);
            const poolPos = poolPositions.get(prize.id);
            const frontendName = displayPrizeName(
              { key: prize.prizeType, name: prize.name, fulfillmentType: prize.fulfillmentType },
              "zh",
            );
            return (
              <div
                key={prize.id}
                ref={(el) => {
                  if (el) prizeCardRefs.current.set(prize.id, el);
                  else prizeCardRefs.current.delete(prize.id);
                }}
                className={`rounded-xl border bg-black/20 transition ${
                  expanded ? "border-amber-500/30" : "border-white/10"
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePrizeExpanded(prize.id)}
                  className="flex w-full items-center gap-3 p-3 text-left md:p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/95 text-xl">
                    {prize.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={prize.imageUrl}
                        alt=""
                        className="h-full w-full object-contain p-0.5"
                        loading="lazy"
                      />
                    ) : (
                      <span>{prize.emoji}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-white/40">
                        #{idx + 1} · ID {prize.id}
                      </span>
                      <p className="truncate font-medium text-white">
                        {prize.name.trim() || "未命名礼品"}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          poolVisible
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {poolVisible ? `奖池第 ${poolPos} 格` : "奖池隐藏"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-white/45">
                      前台显示「{frontendName}」· {displayLabel} · 标识 {prize.prizeType}
                    </p>
                  </div>
                  <span className="shrink-0 text-white/40">{expanded ? "▲" : "▼"}</span>
                </button>

                {expanded && (
                  <div className="border-t border-white/5 px-3 pb-4 md:px-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/5 py-3">
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
                  <button
                    type="button"
                    onClick={() => deletePrize(prize.id, prize.name)}
                    className="ml-auto text-xs text-red-400 hover:underline"
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
                    {prize.fulfillmentType !== "retry" && (
                      <p className="mt-2 text-xs text-white/45">
                        {prize.fulfillmentType === "none"
                          ? "「仅展示」仍会出现在首页奖池和滚轴，但不会真正发给用户。"
                          : "配件/实物、优惠券等会显示在首页奖池（已自动勾选「显示在奖池」）。"}
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
                  className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black sm:w-auto"
                >
                  保存此礼品
                </button>
                  </div>
                )}
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
