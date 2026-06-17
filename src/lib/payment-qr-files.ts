import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { PaymentMethodId } from "@/lib/payments/methods";

const QR_EXTS = ["png", "jpg", "jpeg", "webp"] as const;

export function paymentQrDiskDir(): string {
  return join(process.cwd(), "public", "payments");
}

export function findPaymentQrWebPath(method: PaymentMethodId): string | null {
  const dir = paymentQrDiskDir();
  if (!existsSync(dir)) return null;

  for (const ext of QR_EXTS) {
    const filename = `qr-${method}.${ext}`;
    if (existsSync(join(dir, filename))) return `/payments/${filename}`;
  }

  try {
    const prefix = `qr-${method}.`;
    const hit = readdirSync(dir).find(
      (name) => name.startsWith(prefix) && QR_EXTS.some((e) => name.endsWith(`.${e}`)),
    );
    if (hit) return `/payments/${hit}`;
  } catch {
    /* ignore */
  }

  return null;
}

export function paymentQrExtFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && QR_EXTS.includes(fromName as (typeof QR_EXTS)[number])) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  return "png";
}
