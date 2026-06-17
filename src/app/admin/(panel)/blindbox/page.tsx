"use client";

import { useCallback, useEffect, useState } from "react";
import HeroShowcaseEditor from "@/components/admin/HeroShowcaseEditor";
import ImageUpload from "@/components/admin/ImageUpload";
import type { HeroShowcaseEntry } from "@/lib/hero-showcase";
import { getPrizeRealOdds } from "@/lib/probability";
import {
  DEFAULT_BLIND_BOX_PRICE,
  DEFAULT_GRAND_PRIZE_VALUE,
  DEFAULT_HERO_SUBTITLE,
  formatAdminPrice,
  MARKET_CURRENCY,
} from "@/lib/market";
import { DEFAULT_DEMO_WINNERS, type DemoWinnerEntry } from "@/lib/demo-winners";

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
  heroShowcase?: HeroShowcaseEntry[];
  seoTitle: string | null;
  seoDescription: string | null;
  dailyLimit: number;
  winnersDemoMode?: boolean;
  demoWinners?: DemoWinnerEntry[];
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
  { value: "none", label: "仅展示 (不参与发奖逻辑)" },
];

function emptyPrize(sortOrder: number): Omit<Prize, "id"> {
  return {
    name: "",
    prizeType: "",
    subtitle: "",
    tier: "rare",
    fulfillmentType: "none",
    weight: 0,
    displayOdds: null,
    emoji: "🎁",
    imageUrl: null,
    drawable: false,
    showInPool: true,
    active: true,
    sortOrder,
  };
}

export default function BlindBoxAdminPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    return fetch("/api/admin/blindbox")
      .then((r) => r.json())
      .then((d) => {
        setConfig({
          ...d.config,
          heroShowcase: d.config?.heroShowcase ?? [],
          demoWinners: d.config?.demoWinners?.length
            ? d.config.demoWinners
            : DEFAULT_DEMO_WINNERS,
        });
        setPrizes(d.prizes ?? []);
      });
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  function updateDemoWinner(index: number, patch: Partial<DemoWinnerEntry>) {
    if (!config) return;
    const demoWinners = [...(config.demoWinners ?? DEFAULT_DEMO_WINNERS)];
    demoWinners[index] = { ...demoWinners[index], ...patch };
    setConfig({ ...config, demoWinners });
  }

  function addDemoWinner() {
    if (!config) return;
    const demoWinners = [...(config.demoWinners ?? DEFAULT_DEMO_WINNERS)];
    demoWinners.push({ text: "", isGrand: false, minutesAgo: demoWinners.length * 2 });
    setConfig({ ...config, demoWinners });
  }

  function removeDemoWinner(index: number) {
    if (!config) return;
    const demoWinners = (config.demoWinners ?? DEFAULT_DEMO_WINNERS).filter(
      (_, i) => i !== index,
    );
    setConfig({ ...config, demoWinners });
  }

  function moveDemoWinner(index: number, direction: -1 | 1) {
    if (!config) return;
    const demoWinners = [...(config.demoWinners ?? DEFAULT_DEMO_WINNERS)];
    const target = index + direction;
    if (target < 0 || target >= demoWinners.length) return;
    [demoWinners[index], demoWinners[target]] = [demoWinners[target], demoWinners[index]];
    setConfig({ ...config, demoWinners });
  }

  function resetDemoWinners() {
    if (!config) return;
    setConfig({ ...config, demoWinners: DEFAULT_DEMO_WINNERS.map((row) => ({ ...row })) });
  }

  async function saveConfig() {
    if (!config) return;
    setMsg("保存中...");
    const res = await fetch("/api/admin/blindbox", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      await reload();
      setMsg("✅ 盲盒设置已保存");
    } else {
      setMsg(`❌ ${data.error || "保存失败"}`);
    }
  }

  async function savePrize(prize: Prize) {
    if (!prize.name.trim()) {
      setMsg("❌ 请填写礼品名称");
      return;
    }
    if (!prize.prizeType?.trim()) {
      setMsg("❌ 奖品数据不完整，请刷新页面后重试");
      return;
    }
    setMsg("保存中...");
    const res = await fetch(`/api/admin/blindbox/prizes/${prize.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prize),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setMsg(res.ok ? "✅ 礼品已保存" : `❌ ${data.error || "保存失败"}`);
    if (res.ok) await reload();
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
      }),
    });
    if (res.ok) {
      setMsg("✅ 已添加新礼品，请填写名称并上传图片");
      await reload();
    } else {
      setMsg("❌ 添加失败");
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
          body: JSON.stringify(p),
        }),
      ),
    );
    setMsg("✅ 排序已更新");
  }

  if (loading) return <p className="text-white/50">加载中...</p>;

  const drawWeight = prizes
    .filter((p) => p.active && p.drawable && p.weight > 0)
    .reduce((s, p) => s + p.weight, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">盲盒管理</h1>
      <p className="mt-1 text-white/50">
        管理所有高端礼品：iPhone、电脑、显卡、耳机、相机等。上传图片后会同步到首页奖池和 CS 开箱滚轴。
      </p>
      {msg && <p className="mt-4 text-sm text-amber-400">{msg}</p>}

      {config && (
        <section className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold">盲盒设置</h2>
          <p className="text-xs text-white/40">
            货币单位：{MARKET_CURRENCY}（{formatAdminPrice(DEFAULT_BLIND_BOX_PRICE)}）— 与前台
            market.config.json 一致，保存时自动纠正旧美元文案。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-white/70">抽奖价格 ({MARKET_CURRENCY})</span>
              <input
                type="number"
                min={1}
                value={config.price}
                onChange={(e) =>
                  setConfig({ ...config, price: Number(e.target.value) || DEFAULT_BLIND_BOX_PRICE })
                }
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
              <span className="text-white/70">大奖价值 ({MARKET_CURRENCY})</span>
              <input
                value={config.grandPrizeValue}
                onChange={(e) => setConfig({ ...config, grandPrizeValue: e.target.value })}
                placeholder={DEFAULT_GRAND_PRIZE_VALUE}
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
              <span className="text-white/70">前台中奖动态演示模式（不显示真实中奖）</span>
            </label>
          </div>

          {(config.winnersDemoMode ?? true) && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">演示中奖名单</h3>
                  <p className="mt-1 text-xs text-white/45">
                    前台滚动展示此列表（马来语），与用户选择的语言无关。关闭演示模式后才会显示真实中奖。
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetDemoWinners}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                  >
                    恢复默认
                  </button>
                  <button
                    type="button"
                    onClick={addDemoWinner}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
                  >
                    + 添加一条
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {(config.demoWinners ?? DEFAULT_DEMO_WINNERS).map((row, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <label className="block text-xs sm:col-span-1">
                      <span className="text-white/50">展示文案（马来语）</span>
                      <input
                        value={row.text}
                        onChange={(e) => updateDemoWinner(index, { text: e.target.value })}
                        placeholder="Ahmad dari KL memenangi iPhone 17 Pro Max"
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="flex items-end gap-2 text-xs pb-2">
                      <input
                        type="checkbox"
                        checked={!!row.isGrand}
                        onChange={(e) => updateDemoWinner(index, { isGrand: e.target.checked })}
                      />
                      <span className="text-white/60">大奖</span>
                    </label>
                    <label className="block text-xs">
                      <span className="text-white/50">分钟前</span>
                      <input
                        type="number"
                        min={0}
                        value={row.minutesAgo ?? ""}
                        placeholder="自动"
                        onChange={(e) =>
                          updateDemoWinner(index, {
                            minutesAgo: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        className="mt-1 w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm"
                      />
                    </label>
                    <div className="flex items-end gap-1 pb-1">
                      <button
                        type="button"
                        onClick={() => moveDemoWinner(index, -1)}
                        disabled={index === 0}
                        className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDemoWinner(index, 1)}
                        disabled={index === (config.demoWinners ?? DEFAULT_DEMO_WINNERS).length - 1}
                        className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDemoWinner(index)}
                        className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300"
                      >
                        删
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-white/90">前台数据统计</h3>
            <p className="mt-1 text-xs text-white/45">
              首页「今日参与 / 今日中奖」数字。开启演示模式后显示下方配置值，关闭后显示真实抽奖统计。
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.statsDemoMode ?? true}
                onChange={(e) => setConfig({ ...config, statsDemoMode: e.target.checked })}
              />
              <span className="text-white/70">使用后台配置的展示数据</span>
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-white/70">今日参与人数</span>
                <input
                  type="number"
                  min={0}
                  value={config.displayPlayersToday ?? 0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      displayPlayersToday: Number(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-white/70">今日中奖人数</span>
                <input
                  type="number"
                  min={0}
                  value={config.displayWinnersToday ?? 0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      displayWinnersToday: Number(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                />
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
              placeholder={DEFAULT_HERO_SUBTITLE}
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

      <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">礼品库 ({prizes.length})</h2>
            <p className="mt-1 text-xs text-white/40">
              上方红色区域 = 真实抽奖权重；下方金色区域 = 用户看到的展示概率，两者可不同。
            </p>
          </div>
          <button
            onClick={addPrize}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black"
          >
            + 添加礼品
          </button>
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
                      onChange={(e) => updatePrize(idx, { fulfillmentType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      {FULFILLMENTS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={prize.showInPool}
                      onChange={(e) => updatePrize(idx, { showInPool: e.target.checked })}
                    />
                    <span className="text-white/70">显示在奖池</span>
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

                <div className="mt-3">
                  <ImageUpload
                    label="礼品展示图（PNG/JPG，用于奖池 + 开箱滚轴）"
                    hint="建议 512×512 白底或透明底商品图。系统会自动去掉白底，只保留产品。上传后务必点「保存此礼品」。"
                    value={prize.imageUrl ?? ""}
                    onChange={(url) => updatePrize(idx, { imageUrl: url || null })}
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
