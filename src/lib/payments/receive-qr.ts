import QRCode from "qrcode";
import { findPaymentQrWebPath } from "@/lib/payment-qr-files";
import { type PaymentMethodId } from "./methods";

export type ReceiveSettings = {
  paypalMe: string | null;
  paypalEmail: string | null;
  venmoUsername: string | null;
  zelleContact: string | null;
  receiveLink: string | null;
  receiveNote: string | null;
};

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function cardPayUrl(link: string, amt: string, paymentId: string): string {
  const sep = link.includes("?") ? "&" : "?";
  return `${link}${sep}amount=${amt}&payment_id=${paymentId}`;
}

function staticQrImage(method: PaymentMethodId): string | null {
  return findPaymentQrWebPath(method);
}

/** 根据收款配置生成各支付方式的转账链接 */
export function buildReceiveUrl(
  method: PaymentMethodId,
  amount: number,
  paymentId: string,
  settings: ReceiveSettings,
): string {
  const amt = amount.toFixed(2);
  const payPage = `${siteUrl()}/pay/${paymentId}?method=${method}`;

  switch (method) {
    case "duitnow":
    case "tng":
    case "grabpay":
    case "shopeepay":
    case "crypto":
      return payPage;

    case "paypal":
      if (settings.paypalMe?.trim()) {
        const user = settings.paypalMe.trim().replace(/^@/, "");
        return `https://paypal.me/${user}/${amt}USD`;
      }
      if (settings.paypalEmail?.trim()) {
        return `https://www.paypal.com/paypalme/send?email=${encodeURIComponent(settings.paypalEmail.trim())}&amount=${amt}&currencyCode=USD`;
      }
      return payPage;

    case "visa":
      return settings.receiveLink?.trim()
        ? cardPayUrl(settings.receiveLink.trim(), amt, paymentId)
        : payPage;

    case "crypto":
      return payPage;

    case "qr":
      return payPage;

    default:
      return payPage;
  }
}

export async function generateMethodQr(
  method: PaymentMethodId,
  amount: number,
  paymentId: string,
  settings: ReceiveSettings,
): Promise<{ url: string; qrDataUrl: string; direct: boolean; staticImage?: boolean }> {
  const staticImage = staticQrImage(method);
  if (staticImage) {
    const url = buildReceiveUrl(method, amount, paymentId, settings);
    return { url, qrDataUrl: staticImage, direct: true, staticImage: true };
  }

  const url = buildReceiveUrl(method, amount, paymentId, settings);
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 260,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const direct =
    (method === "paypal" && !!(settings.paypalMe || settings.paypalEmail)) ||
    (method === "visa" && !!settings.receiveLink);

  return { url, qrDataUrl, direct };
}

type SettingsRow = ReceiveSettings & {
  homeSeoTitle?: string | null;
  homeSeoDescription?: string | null;
};

export async function getReceiveSettings(): Promise<ReceiveSettings> {
  const { prisma } = await import("@/lib/prisma");
  const s = (await prisma.siteSettings.findFirst({
    where: { id: 1 },
  })) as SettingsRow | null;
  return {
    paypalMe: s?.paypalMe ?? null,
    paypalEmail: s?.paypalEmail ?? null,
    venmoUsername: s?.venmoUsername ?? null,
    zelleContact: s?.zelleContact ?? null,
    receiveLink: s?.receiveLink ?? null,
    receiveNote: s?.receiveNote ?? null,
  };
}
