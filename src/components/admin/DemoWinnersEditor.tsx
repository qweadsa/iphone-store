"use client";

import {
  DEFAULT_DEMO_WINNERS,
  type DemoWinnerEntry,
} from "@/lib/demo-winners";

type Props = {
  value: DemoWinnerEntry[];
  onChange: (entries: DemoWinnerEntry[]) => void;
};

function emptyRow(): DemoWinnerEntry {
  return { text: "", isGrand: false, minutesAgo: null };
}

export default function DemoWinnersEditor({ value, onChange }: Props) {
  const rows = value.length ? value : [emptyRow()];

  function updateRow(index: number, patch: Partial<DemoWinnerEntry>) {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function moveRow(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-white/50">
          共 {rows.filter((r) => r.text.trim()).length} 条 · 前台滚动展示，可自定义文案与时间
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange([...rows, emptyRow()])}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
          >
            + 添加一条
          </button>
          <button
            type="button"
            onClick={() => onChange([...DEFAULT_DEMO_WINNERS])}
            className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/10"
          >
            恢复默认 {DEFAULT_DEMO_WINNERS.length} 条
          </button>
        </div>
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-lg border border-white/10 p-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 sm:flex-row sm:items-center"
          >
            <span className="shrink-0 text-xs text-white/35 sm:w-6">{index + 1}</span>
            <input
              value={row.text}
              onChange={(e) => updateRow(index, { text: e.target.value })}
              placeholder="例：吉隆坡 Ahmad 抽中 iPhone 17 Pro Max"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              value={row.minutesAgo ?? ""}
              onChange={(e) =>
                updateRow(index, {
                  minutesAgo: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="分钟前"
              title="显示为「X 分钟前」；留空则按顺序自动递增"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm sm:w-24"
            />
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-white/60">
              <input
                type="checkbox"
                checked={!!row.isGrand}
                onChange={(e) => updateRow(index, { isGrand: e.target.checked })}
              />
              大奖
            </label>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => moveRow(index, -1)}
                disabled={index === 0}
                className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveRow(index, 1)}
                disabled={index === rows.length - 1}
                className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300"
              >
                删
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
