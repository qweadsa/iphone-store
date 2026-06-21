import { zhText } from "@/lib/zh-hant";

export type DemoWinnerEntry = {
  text: string;
  isGrand?: boolean;
  /** 距现在的分钟数；留空则按列表顺序自动生成 */
  minutesAgo?: number | null;
};

/** 默认 35 条演示中奖（马来语 · 对齐当前奖池 · 以 iPhone / 相机 / 主机等大件为主） */
export const DEFAULT_DEMO_WINNERS: DemoWinnerEntry[] = [
  { text: "Ahmad dari KL memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 0 },
  { text: "Siti dari Johor memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 1 },
  { text: "Lim dari Pulau Pinang memenangi MacBook Pro 16\"", isGrand: true, minutesAgo: 2 },
  { text: "Farah dari Selangor memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 3 },
  { text: "Hafiz dari Sabah memenangi Sony A7 IV Camera", minutesAgo: 4 },
  { text: "Raj dari Melaka memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 5 },
  { text: "Nur dari Terengganu memenangi ROG Gaming Desktop", minutesAgo: 6 },
  { text: "Wei dari Perak memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 7 },
  { text: "David dari Negeri Sembilan memenangi RTX 4090 Founders", minutesAgo: 8 },
  { text: "Aina dari Kedah memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 9 },
  { text: "Ken dari Sarawak memenangi iPad Pro M4", minutesAgo: 10 },
  { text: "Mei dari Pahang memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 11 },
  { text: "Arif dari Putrajaya memenangi MacBook Pro 16\"", isGrand: true, minutesAgo: 12 },
  { text: "Priya dari Pulau Pinang memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 13 },
  { text: "Hakim dari Johor memenangi ROG Gaming Desktop", minutesAgo: 14 },
  { text: "Yen dari Selangor memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 15 },
  { text: "Daniel dari Sabah memenangi Sony A7 IV Camera", minutesAgo: 16 },
  { text: "Sofia dari Melaka memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 17 },
  { text: "Kumar dari Perak memenangi MacBook Pro 16\"", isGrand: true, minutesAgo: 18 },
  { text: "Amira dari Terengganu memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 19 },
  { text: "Chen dari Negeri Sembilan memenangi 4K OLED Monitor", minutesAgo: 20 },
  { text: "Irfan dari Kedah memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 21 },
  { text: "Grace dari Sarawak memenangi RTX 4090 Founders", minutesAgo: 22 },
  { text: "Adam dari Pahang memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 23 },
  { text: "Zara dari Putrajaya memenangi AirPods Max", minutesAgo: 24 },
  { text: "Jason dari KL memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 25 },
  { text: "Nadia dari Pulau Pinang memenangi MacBook Pro 16\"", isGrand: true, minutesAgo: 26 },
  { text: "Marcus dari Johor memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 27 },
  { text: "Elaine dari Selangor memenangi ROG Gaming Desktop", minutesAgo: 28 },
  { text: "Faiz dari Sabah memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 29 },
  { text: "Joy dari Melaka memenangi Sony A7 IV Camera", minutesAgo: 30 },
  { text: "Omar dari Perak memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 31 },
  { text: "Sarah dari KL memenangi iPad Pro M4", minutesAgo: 32 },
  { text: "Rizal dari Sarawak memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 33 },
  { text: "Lisa dari Perlis memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 34 },
];

export function parseDemoWinners(raw: unknown): DemoWinnerEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_DEMO_WINNERS;

  const parsed = raw
    .map((item): DemoWinnerEntry | null => {
      if (typeof item === "string" && item.trim()) {
        const text = item.trim();
        return {
          text,
          isGrand: /iphone|macbook/i.test(text),
        };
      }
      if (item && typeof item === "object" && "text" in item) {
        const row = item as DemoWinnerEntry;
        if (!row.text?.trim()) return null;
        return {
          text: row.text.trim(),
          isGrand: row.isGrand ?? /iphone|macbook/i.test(row.text),
          minutesAgo: row.minutesAgo ?? null,
        };
      }
      return null;
    })
    .filter((row): row is DemoWinnerEntry => row !== null);

  return parsed.length ? parsed : DEFAULT_DEMO_WINNERS;
}

export function serializeDemoWinners(entries: DemoWinnerEntry[]): DemoWinnerEntry[] {
  return entries
    .map((row) => ({
      text: row.text.trim(),
      isGrand: !!row.isGrand,
      minutesAgo: row.minutesAgo ?? null,
    }))
    .filter((row) => row.text.length > 0);
}

export function formatDemoWinnerTimeLabel(minutesAgo: number, locale: string): string {
  if (minutesAgo <= 0) {
    if (locale === "zh") return zhText(locale, "刚刚");
    if (locale === "ms") return "Baru sahaja";
    return "Just now";
  }
  if (locale === "zh") return zhText(locale, `${minutesAgo} 分钟前`);
  if (locale === "ms") return `${minutesAgo} minit lalu`;
  return `${minutesAgo} min ago`;
}

export function resolveDemoWinnerMinutesAgo(
  entry: DemoWinnerEntry,
  index: number,
): number {
  if (entry.minutesAgo != null && !Number.isNaN(entry.minutesAgo)) {
    return Math.max(0, entry.minutesAgo);
  }
  return index * 2;
}

export function demoWinnerIcon(entry: DemoWinnerEntry): string {
  if (entry.isGrand) return "🏆";
  const t = entry.text.toLowerCase();
  if (/kredit|store credit|rm50/i.test(t)) return "💰";
  if (/kupon|coupon|diskaun/i.test(t)) return "🎟️";
  if (/sony|camera|kamera/i.test(t)) return "📷";
  if (/rog|gaming|rtx|desktop|pc/i.test(t)) return "🎮";
  if (/macbook|ipad|iphone/i.test(t)) return "📱";
  return "🎁";
}
