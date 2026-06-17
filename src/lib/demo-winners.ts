export type DemoWinnerEntry = {
  text: string;
  isGrand?: boolean;
  /** 距现在的分钟数；留空则按列表顺序自动生成 */
  minutesAgo?: number | null;
};

export const DEFAULT_DEMO_WINNERS: DemoWinnerEntry[] = [
  { text: "Ahmad dari KL memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 0 },
  { text: "Siti dari Johor memenangi Kredit Kedai RM50", minutesAgo: 2 },
  { text: "Raj dari Penang memenangi Sarung Telefon Premium", minutesAgo: 4 },
  { text: "Farah dari Selangor memenangi iPhone 17 Pro Max", isGrand: true, minutesAgo: 6 },
  { text: "Hafiz dari Sabah memenangi Kupon Diskaun 20%", minutesAgo: 8 },
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

export function formatDemoWinnerTimeLabel(minutesAgo: number): string {
  if (minutesAgo <= 0) return "Baru sahaja";
  return `${minutesAgo} minit lalu`;
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
