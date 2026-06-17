export type BlindBoxCheckout = {
  fullPrice: number;
  walletUse: number;
  cashDue: number;
  hasWalletDiscount: boolean;
};

export type BlindBoxPaymentMeta = {
  fullPrice: number;
  walletUse: number;
  walletSettled?: boolean;
};

export function computeBlindBoxCheckout(
  fullPrice: number,
  walletBalance: number,
): BlindBoxCheckout {
  const safePrice = Math.max(0, Math.round(fullPrice * 100) / 100);
  const safeBalance = Math.max(0, Math.round(walletBalance * 100) / 100);
  const walletUse = Math.min(safeBalance, safePrice);
  const cashDue = Math.round((safePrice - walletUse) * 100) / 100;
  return {
    fullPrice: safePrice,
    walletUse,
    cashDue,
    hasWalletDiscount: walletUse > 0,
  };
}

export function parseBlindBoxPaymentMeta(metadata: unknown): BlindBoxPaymentMeta | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, unknown>;
  const fullPrice = Number(m.fullPrice);
  const walletUse = Number(m.walletUse);
  if (!Number.isFinite(fullPrice) || !Number.isFinite(walletUse)) return null;
  return {
    fullPrice,
    walletUse,
    walletSettled: m.walletSettled === true,
  };
}
