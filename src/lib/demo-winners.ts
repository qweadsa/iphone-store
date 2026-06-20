export type DemoWinnerEntry = {
  text: string;
  isGrand?: boolean;
  /** 距现在的分钟数；留空则按列表顺序自动生成 */
  minutesAgo?: number | null;
};

export const DEFAULT_DEMO_WINNERS: DemoWinnerEntry[] = [
  { text: "吉隆坡 Ahmad 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 0 },
  { text: "槟城 Lim 获得 MacBook Pro 16", isGrand: true, minutesAgo: 1 },
  { text: "柔佛 Siti 获得 RM50 商城抵扣券", minutesAgo: 2 },
  { text: "雪兰莪 Farah 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 3 },
  { text: "沙巴 Hafiz 获得 AirPods Max", minutesAgo: 4 },
  { text: "马六甲 Raj 获得 RTX 4090 显卡", minutesAgo: 5 },
  { text: "霹雳 Wei 获得 8 折优惠券", minutesAgo: 6 },
  { text: "登嘉楼 Nur 获得精品手机壳", minutesAgo: 7 },
  { text: "森美兰 David 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 8 },
  { text: "吉打 Aina 获得 RM50 商城抵扣券", minutesAgo: 9 },
  { text: "砂拉越 Ken 获得 OLED 4K 显示器", minutesAgo: 10 },
  { text: "彭亨 Mei 获得 iPad Pro", minutesAgo: 11 },
  { text: "布城 Arif 获得 ROG 电竞主机", minutesAgo: 12 },
  { text: "玻璃市 Lisa 获得 8 折优惠券", minutesAgo: 13 },
  { text: "吉隆坡 Jason 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 14 },
  { text: "槟城 Priya 获得 Sony A7 IV 相机", minutesAgo: 15 },
  { text: "柔佛 Hakim 获得 NVMe SSD 2TB", minutesAgo: 16 },
  { text: "雪兰莪 Yen 获得机械键盘", minutesAgo: 17 },
  { text: "沙巴 Daniel 获得 RM50 商城抵扣券", minutesAgo: 18 },
  { text: "马六甲 Sofia 获得 AirPods Max", minutesAgo: 19 },
  { text: "霹雳 Kumar 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 21 },
  { text: "登嘉楼 Amira 获得 DDR5 内存条", minutesAgo: 23 },
  { text: "森美兰 Chen 获得精品手机壳", minutesAgo: 25 },
  { text: "吉打 Irfan 获得 8 折优惠券", minutesAgo: 27 },
  { text: "砂拉越 Grace 获得 MacBook Pro 16", isGrand: true, minutesAgo: 29 },
  { text: "彭亨 Adam 获得 RM50 商城抵扣券", minutesAgo: 31 },
  { text: "布城 Zara 获得 RTX 4090 显卡", minutesAgo: 33 },
  { text: "吉隆坡 Ben 获得 OLED 4K 显示器", minutesAgo: 35 },
  { text: "槟城 Nadia 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 37 },
  { text: "柔佛 Marcus 获得 iPad Pro", minutesAgo: 39 },
  { text: "雪兰莪 Elaine 获得 ROG 电竞主机", minutesAgo: 41 },
  { text: "沙巴 Faiz 获得 Sony A7 IV 相机", minutesAgo: 43 },
  { text: "马六甲 Joy 获得 8 折优惠券", minutesAgo: 45 },
  { text: "霹雳 Omar 获得 RM50 商城抵扣券", minutesAgo: 47 },
  { text: "吉隆坡 Sarah 抽中 iPhone 17 Pro Max", isGrand: true, minutesAgo: 50 },
];

export function parseDemoWinners(raw: unknown): DemoWinnerEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_DEMO_WINNERS;

  const parsed = raw
    .map((item): DemoWinnerEntry | null => {
      if (typeof item === "string" && item.trim()) {
        const text = item.trim();
        return {
          text,
          isGrand: /iphone/i.test(text),
        };
      }
      if (item && typeof item === "object" && "text" in item) {
        const row = item as DemoWinnerEntry;
        if (!row.text?.trim()) return null;
        return {
          text: row.text.trim(),
          isGrand: row.isGrand ?? /iphone/i.test(row.text),
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
    if (locale === "zh") return "刚刚";
    if (locale === "ms") return "Baru sahaja";
    return "Just now";
  }
  if (locale === "zh") return `${minutesAgo} 分钟前`;
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
  if (/抵扣|credit|kredit|rm50|store credit/i.test(t)) return "💰";
  if (/优惠券|coupon|diskaun|折扣/i.test(t)) return "🎟️";
  return "🎁";
}
