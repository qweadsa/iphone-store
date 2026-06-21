import OpenCC from "opencc-js";

let converter: ((text: string) => string) | null = null;

function getConverter(): (text: string) => string {
  if (!converter) {
    converter = OpenCC.Converter({ from: "cn", to: "hk" });
  }
  return converter;
}

/** 简体 → 香港繁体（已繁体则基本不变） */
export function toTraditional(text: string): string {
  if (!text) return text;
  return getConverter()(text);
}

export function deepToTraditional<T>(value: T): T {
  if (typeof value === "string") {
    return toTraditional(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepToTraditional(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = deepToTraditional(nested);
    }
    return out as T;
  }
  return value;
}

/** 仅 zh 语言时转为繁体 */
export function zhText(locale: string, text: string): string {
  return locale === "zh" ? toTraditional(text) : text;
}
