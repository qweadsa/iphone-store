export type PaymentMethodId =
  | "duitnow"
  | "balance"
  | "qr"
  /** @deprecated legacy stored payments */
  | "tng"
  | "grabpay"
  | "shopeepay"
  | "visa"
  | "paypal"
  | "crypto";

export type PaymentMethodDef = {
  id: PaymentMethodId;
  label: string;
  short: string;
  hint?: string;
};

/** 收银台：马来西亚 DuitNow QR 扫码支付 */
export const CHECKOUT_METHODS: PaymentMethodDef[] = [
  { id: "duitnow", label: "DuitNow QR", short: "DuitNow QR", hint: "马来西亚统一扫码支付" },
];

export const DEFAULT_CHECKOUT_METHOD: PaymentMethodId = "duitnow";

export function getMethodLabel(id: PaymentMethodId): string {
  return CHECKOUT_METHODS.find((m) => m.id === id)?.label ?? id;
}

/** 静态收款二维码路径（上传图片到 public/payments/ 即可生效） */
export const STATIC_QR_PATHS: Partial<Record<PaymentMethodId, string>> = {
  duitnow: "/payments/qr-duitnow.png",
};
