import { normalizeTelegramUrl } from "@/lib/telegram-url";

export type SupportChannel = "telegram" | "whatsapp";

export function normalizeWhatsAppUrl(input: string | null | undefined): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "wa.me" || host === "api.whatsapp.com") return url.toString();
    } catch {
      return null;
    }
    return null;
  }

  if (/^wa\.me\//i.test(raw)) return `https://${raw}`;

  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8 && digits.length <= 15) {
    return `https://wa.me/${digits}`;
  }

  return null;
}

export function normalizeSupportUrl(
  input: string | null | undefined,
): { url: string; channel: SupportChannel } | null {
  const whatsapp = normalizeWhatsAppUrl(input);
  if (whatsapp) return { url: whatsapp, channel: "whatsapp" };

  const telegram = normalizeTelegramUrl(input);
  if (telegram) return { url: telegram, channel: "telegram" };

  return null;
}
