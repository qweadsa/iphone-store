export function normalizeTelegramUrl(input: string | null | undefined): string | null {
  const raw = input?.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw;

  if (raw.startsWith("t.me/")) return `https://${raw}`;

  const username = raw.startsWith("@") ? raw.slice(1) : raw;
  if (!/^[a-zA-Z0-9_]{4,32}$/.test(username)) return null;

  return `https://t.me/${username}`;
}
