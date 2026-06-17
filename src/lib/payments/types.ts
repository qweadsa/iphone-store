export type PaymentPurpose = "blindbox" | "order" | "recharge" | "cart";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
export type PaymentMethod = "balance" | "paypal" | "stripe" | "qr" | "demo";

export type CreatePaymentInput = {
  amount: number;
  purpose: PaymentPurpose;
  userId?: number;
  email?: string;
  metadata?: Record<string, unknown>;
};

export type MethodQr = {
  url: string;
  qrDataUrl: string;
  direct: boolean;
  staticImage?: boolean;
};
export type PaymentResult = {
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  payUrl?: string;
  qrDataUrl?: string;
  paypalClientId?: string;
  demoMode: boolean;
  methodQrs?: Partial<Record<string, MethodQr>>;
  receiveNote?: string | null;
  requireAdminConfirm?: boolean;
};
