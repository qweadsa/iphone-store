export type ProductColor = { name: string; hex: string };
export type StorageOption = { size: string; price: number };

function parseJson(text: string, label: string): unknown {
  try {
    return JSON.parse(text.trim());
  } catch {
    throw new Error(
      `${label} JSON 无法解析。即使只有 1 个选项，也必须用方括号 [ ] 包住。`,
    );
  }
}

function ensureArray<T>(value: unknown, label: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") return [value as T];
  throw new Error(`${label} 必须是数组，例如：[{ ... }]，单颜色也要加 [ ]`);
}

export function parseColorsJson(raw: string): ProductColor[] {
  const parsed = ensureArray<Record<string, unknown>>(
    parseJson(raw, "外观颜色"),
    "外观颜色",
  );

  if (parsed.length === 0) {
    throw new Error('外观颜色至少填 1 项，例如：[{ "name": "Kuning", "hex": "#F6D365" }]');
  }

  return parsed.map((item, index) => {
    const name = String(item.name ?? "").trim();
    const hex = String(item.hex ?? "").trim();
    if (!name || !hex) {
      throw new Error(`外观颜色第 ${index + 1} 项缺少 name 或 hex`);
    }
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
      throw new Error(`外观颜色第 ${index + 1} 项 hex 无效：${hex}（示例 #F6D365）`);
    }
    return { name, hex };
  });
}

export function parseStorageJson(raw: string): StorageOption[] {
  const parsed = ensureArray<Record<string, unknown>>(
    parseJson(raw, "存储 & 价格"),
    "存储 & 价格",
  );

  if (parsed.length === 0) {
    throw new Error('存储至少填 1 项，例如：[{ "size": "1TB", "price": 7999 }]');
  }

  return parsed.map((item, index) => {
    const size = String(item.size ?? "").trim();
    const price = Number(item.price);
    if (!size || Number.isNaN(price)) {
      throw new Error(`存储第 ${index + 1} 项需包含 size 和 price`);
    }
    return { size, price };
  });
}
