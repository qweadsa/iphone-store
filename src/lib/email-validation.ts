/** 常用邮箱域名（付款 / 查单 / 填地址） */
export const SUPPORTED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "outlook.my",
  "yahoo.com",
  "yahoo.com.my",
  "yahoo.com.sg",
  "yahoo.co.uk",
  "yahoo.co.id",
  "yahoo.co.jp",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "zoho.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "tuta.io",
  "tutanota.com",
  "hey.com",
  "fastmail.com",
  "qq.com",
  "foxmail.com",
  "163.com",
  "126.com",
  "yeah.net",
  "sina.com",
  "sina.cn",
  "139.com",
  "189.cn",
  "aliyun.com",
  "sohu.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "kakao.com",
] as const;

const DOMAIN_SET = new Set<string>(SUPPORTED_EMAIL_DOMAINS);

const BASIC_EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export type EmailValidationReason = "empty" | "format" | "domain";

export type EmailValidationResult =
  | { valid: true; normalized: string; domain: string }
  | { valid: false; reason: EmailValidationReason };

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function extractEmailDomain(email: string): string | null {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  if (at <= 0 || at === normalized.length - 1) return null;
  return normalized.slice(at + 1);
}

export function isSupportedEmailDomain(domain: string): boolean {
  return DOMAIN_SET.has(domain.trim().toLowerCase());
}

export function validateEmail(raw: string): EmailValidationResult {
  const normalized = normalizeEmail(raw);
  if (!normalized) return { valid: false, reason: "empty" };
  if (!normalized.includes("@")) return { valid: false, reason: "format" };
  if (!BASIC_EMAIL_RE.test(normalized)) return { valid: false, reason: "format" };

  const domain = extractEmailDomain(normalized);
  if (!domain || !isSupportedEmailDomain(domain)) {
    return { valid: false, reason: "domain" };
  }

  return { valid: true, normalized, domain };
}

export function isValidEmail(raw: string): boolean {
  return validateEmail(raw).valid;
}

/** 前台展示用：常用邮箱示例 */
export const COMMON_EMAIL_EXAMPLES = [
  "you@gmail.com",
  "you@yahoo.com",
  "you@outlook.com",
  "you@hotmail.com",
  "you@icloud.com",
  "you@qq.com",
  "you@163.com",
] as const;

/** 分组展示（后台/提示文案） */
export const EMAIL_PROVIDER_GROUPS = [
  { name: "Gmail", domains: ["gmail.com", "googlemail.com"] },
  { name: "Yahoo", domains: ["yahoo.com", "yahoo.com.my", "yahoo.com.sg", "yahoo.co.uk"] },
  { name: "Outlook / Hotmail", domains: ["outlook.com", "hotmail.com", "live.com", "msn.com"] },
  { name: "iCloud", domains: ["icloud.com", "me.com"] },
  { name: "QQ / 腾讯", domains: ["qq.com", "foxmail.com"] },
  { name: "网易", domains: ["163.com", "126.com", "yeah.net"] },
  { name: "Proton", domains: ["proton.me", "protonmail.com", "pm.me"] },
] as const;

export function getEmailValidationMessage(
  reason: EmailValidationReason,
  locale: string,
): string {
  const zh = locale === "zh";
  const ms = locale === "ms";
  if (reason === "empty") {
    if (zh) return "请填写邮箱";
    if (ms) return "Sila isi email";
    return "Please enter your email";
  }
  if (reason === "format") {
    if (zh) return "邮箱格式不正确，需包含 @ 和有效域名，例如 you@gmail.com";
    if (ms) return "Format email tidak sah. Contoh: you@gmail.com";
    return "Invalid email format. Example: you@gmail.com";
  }
  if (zh) return "请使用常用邮箱（如 Gmail、Yahoo、Outlook、Hotmail、iCloud、QQ、163 等）";
  if (ms) return "Sila guna email biasa (Gmail, Yahoo, Outlook, Hotmail, iCloud, QQ, 163, dll.)";
  return "Please use a common email provider (Gmail, Yahoo, Outlook, Hotmail, iCloud, QQ, 163, etc.)";
}
