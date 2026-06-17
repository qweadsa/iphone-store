"use client";

export type ProductColor = { name: string; hex: string };
export type StorageOption = { size: string; price: number };

type ColorEditorProps = {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
};

export function ProductColorEditor({ colors, onChange }: ColorEditorProps) {
  function update(index: number, patch: Partial<ProductColor>) {
    onChange(colors.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function remove(index: number) {
    if (colors.length <= 1) return;
    onChange(colors.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...colors, { name: "", hex: "#F6D365" }]);
  }

  return (
    <div className="space-y-3">
      {colors.map((color, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_56px_120px_auto]"
        >
          <label className="block text-xs sm:col-span-4">
            <span className="text-white/50">颜色名称（前台显示）</span>
            <input
              value={color.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Kuning"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="text-white/50">色块</span>
            <input
              type="color"
              value={color.hex.length === 7 ? color.hex : "#F6D365"}
              onChange={(e) => update(index, { hex: e.target.value })}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-white/10 bg-transparent"
            />
          </label>
          <label className="block text-xs">
            <span className="text-white/50">Hex</span>
            <input
              value={color.hex}
              onChange={(e) => update(index, { hex: e.target.value })}
              placeholder="#F6D365"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={colors.length <= 1}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/5 disabled:opacity-30"
            >
              删除
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-white/60 hover:border-amber-500/40 hover:text-amber-400"
      >
        + 添加颜色
      </button>
      <p className="text-xs text-white/40">只有 1 种颜色时保留 1 行即可，无需填 JSON。</p>
    </div>
  );
}

type StorageEditorProps = {
  options: StorageOption[];
  onChange: (options: StorageOption[]) => void;
};

export function ProductStorageEditor({ options, onChange }: StorageEditorProps) {
  function update(index: number, patch: Partial<StorageOption>) {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function remove(index: number) {
    if (options.length <= 1) return;
    onChange(options.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...options, { size: "", price: 0 }]);
  }

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-[1fr_140px_auto]"
        >
          <label className="block text-xs">
            <span className="text-white/50">容量</span>
            <input
              value={option.size}
              onChange={(e) => update(index, { size: e.target.value })}
              placeholder="1TB"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs">
            <span className="text-white/50">价格 (MYR)</span>
            <input
              type="number"
              min={0}
              value={option.price || ""}
              onChange={(e) => update(index, { price: Number(e.target.value) || 0 })}
              placeholder="7999"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={options.length <= 1}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/5 disabled:opacity-30"
            >
              删除
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-white/60 hover:border-amber-500/40 hover:text-amber-400"
      >
        + 添加容量规格
      </button>
      <p className="text-xs text-white/40">这里填容量和价格，不要填颜色 hex/name。</p>
    </div>
  );
}

export function validateColors(colors: ProductColor[]): string | null {
  if (colors.length === 0) return "请至少保留 1 种颜色";
  for (let i = 0; i < colors.length; i++) {
    const { name, hex } = colors[i];
    if (!name.trim()) return `第 ${i + 1} 个颜色缺少名称`;
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim())) {
      return `第 ${i + 1} 个颜色 Hex 无效（示例 #F6D365）`;
    }
  }
  return null;
}

export function validateStorage(options: StorageOption[]): string | null {
  if (options.length === 0) return "请至少保留 1 个容量规格";
  for (let i = 0; i < options.length; i++) {
    const { size, price } = options[i];
    if (!size.trim()) return `第 ${i + 1} 个规格缺少容量（如 1TB）`;
    if (!price || price <= 0) return `第 ${i + 1} 个规格价格无效`;
  }
  return null;
}
