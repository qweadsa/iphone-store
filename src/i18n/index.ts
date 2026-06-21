import type { Locale } from "./config";
import { en, type Messages } from "./messages/en";
import { ms } from "./messages/ms";
import { zh } from "./messages/zh";
import { ja } from "./messages/ja";
import { ko } from "./messages/ko";
import { deepToTraditional } from "@/lib/zh-hant";

export type { Messages, Locale };

const messages: Record<Locale, Messages> = { ms, en, zh, ja, ko };

export function getMessages(locale: Locale): Messages {
  const raw = messages[locale] ?? ms;
  if (locale === "zh") return deepToTraditional(raw);
  return raw;
}

export function t(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(`{${key}}`, String(val)),
    template,
  );
}
