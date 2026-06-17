import { maskEmail } from "@/lib/blindbox-fulfillment";
import { contentLang } from "@/lib/locale-resolve";

export type GrandPrizeStatus = "available" | "claimed";

export type PublicWinnerRow = {
  id: number;
  prizeName: string;
  email: string | null;
  prizeType: string;
  createdAt: string;
};

export type PublicWinner = {
  id: number;
  text: string;
  isGrand: boolean;
};

export function toPublicWinnerRows<
  T extends {
    id: number;
    prizeName: string;
    email: string | null;
    prizeType: string;
    createdAt: Date;
  },
>(rows: T[]): PublicWinnerRow[] {
  return rows.map((r) => ({
    id: r.id,
    prizeName: r.prizeName,
    email: r.email,
    prizeType: r.prizeType,
    createdAt: r.createdAt.toISOString(),
  }));
}

function toTimestamp(date: Date | string): number {
  if (date instanceof Date) return date.getTime();
  return new Date(date).getTime();
}

export function formatTimeAgo(
  date: Date | string,
  locale: string,
  nowMs: number = Date.now(),
): string {
  const lang = contentLang(locale);
  const mins = Math.max(0, Math.floor((nowMs - toTimestamp(date)) / 60000));
  if (mins < 1) {
    if (lang === "zh") return "刚刚";
    if (lang === "ms") return "Baru sahaja";
    return "Just now";
  }
  if (mins < 60) {
    if (lang === "zh") return `${mins} 分钟前`;
    if (lang === "ms") return `${mins} minit lalu`;
    return `${mins} min ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    if (lang === "zh") return `${hrs} 小时前`;
    if (lang === "ms") return `${hrs} jam lalu`;
    return `${hrs} hr ago`;
  }
  if (lang === "zh") return "今日早些时候";
  if (lang === "ms") return "Awal hari ini";
  return "Earlier today";
}

export function formatPublicWinnerLine(
  prizeName: string,
  email: string | null,
  prizeType: string,
  locale: string,
): string {
  const lang = contentLang(locale);
  const who =
    email
      ? maskEmail(email)
      : lang === "zh"
        ? "玩家"
        : lang === "ms"
          ? "Pemain"
          : "Player";
  if (prizeType === "grand") {
    if (lang === "zh") return `${who} 抽中今日大奖 ${prizeName}`;
    if (lang === "ms") return `${who} memenangi hadiah utama hari ini ${prizeName}`;
    return `${who} won today's grand prize ${prizeName}`;
  }
  if (lang === "zh") return `${who} 刚刚开启礼盒，获得 ${prizeName}`;
  if (lang === "ms") return `${who} membuka kotak dan memenangi ${prizeName}`;
  return `${who} just opened a box and won ${prizeName}`;
}
