"use client";

import { COMMON_EMAIL_EXAMPLES, SUPPORTED_EMAIL_DOMAINS } from "@/lib/email-validation";
import { useI18n } from "@/lib/i18n-context";
import { zhText } from "@/lib/zh-hant";

type Props = {
  compact?: boolean;
  className?: string;
};

export default function SupportedEmailHint({ compact = false, className = "" }: Props) {
  const { locale, messages: m } = useI18n();
  const p = m.payment;

  const topDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "qq.com", "163.com"];

  if (compact) {
    return (
      <p className={`text-[11px] leading-relaxed text-white/40 ${className}`}>
        {p.guestEmailSupported}{" "}
        {topDomains.map((d) => `@${d}`).join(" · ")}
      </p>
    );
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] p-3 ${className}`}>
      <p className="text-xs font-medium text-white/70">{p.guestEmailSupported}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {topDomains.map((d) => (
          <span
            key={d}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/65"
          >
            @{d}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-white/40">
        {locale === "zh" ? zhText(locale, "示例：") : locale === "ms" ? "Contoh: " : "Examples: "}
        {COMMON_EMAIL_EXAMPLES.slice(0, 4).join(locale === "zh" ? "、" : ", ")}
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-[11px] text-[#FFB800]/90">
          {locale === "zh"
            ? zhText(locale, `查看全部 ${SUPPORTED_EMAIL_DOMAINS.length} 个支持域名`)
            : locale === "ms"
              ? `Lihat semua ${SUPPORTED_EMAIL_DOMAINS.length} domain`
              : `View all ${SUPPORTED_EMAIL_DOMAINS.length} supported domains`}
        </summary>
        <p className="mt-2 break-words text-[10px] leading-relaxed text-white/35">
          {SUPPORTED_EMAIL_DOMAINS.map((d) => `@${d}`).join(" · ")}
        </p>
      </details>
    </div>
  );
}
