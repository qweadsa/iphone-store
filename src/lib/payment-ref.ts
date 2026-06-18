/** 用户转账备注用的短参考号（去掉 PAY- 前缀，方便在 TNG 备注里填写） */
export function getPaymentTransferRef(paymentId: string): string {
  return paymentId.replace(/^PAY-/, "").trim() || paymentId;
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
