/** 5 位纯数字转账参考号（TNG 备注用） */
export function generateTransferRef(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/** 用户转账备注用的短参考号 */
export function getPaymentTransferRef(paymentId: string, metadata?: unknown): string {
  if (metadata && typeof metadata === "object" && metadata !== null) {
    const ref = (metadata as { transferRef?: unknown }).transferRef;
    if (typeof ref === "string" && /^\d{5}$/.test(ref)) return ref;
  }
  const digits = paymentId.replace(/\D/g, "");
  if (digits.length >= 5) return digits.slice(-5);
  return digits.padStart(5, "0").slice(-5);
}

export function formatPaymentAge(iso: string, nowMs = Date.now()): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} 秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  return `${Math.floor(hr / 24)} 天前`;
}
