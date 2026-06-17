import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { requireAdmin } from "@/lib/admin-auth";
import { CHECKOUT_METHODS } from "@/lib/payments/methods";
import {
  findPaymentQrWebPath,
  paymentQrDiskDir,
  paymentQrExtFromFile,
} from "@/lib/payment-qr-files";
import { validateImageFile } from "@/lib/save-image";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const qrs = CHECKOUT_METHODS.map((m) => {
    const url = findPaymentQrWebPath(m.id);
    return {
      method: m.id,
      label: m.label,
      url,
      uploaded: !!url,
    };
  });

  return NextResponse.json({ qrs });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const method = String(form.get("method") ?? "");

  if (!CHECKOUT_METHODS.some((m) => m.id === method)) {
    return NextResponse.json({ error: "无效的支付方式" }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "请选择图片" }, { status: 400 });
  }

  const err = validateImageFile(file);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }

  const ext = paymentQrExtFromFile(file);
  const dir = paymentQrDiskDir();
  await mkdir(dir, { recursive: true });

  for (const oldExt of ["png", "jpg", "jpeg", "webp"]) {
    const oldPath = join(dir, `qr-${method}.${oldExt}`);
    if (existsSync(oldPath)) {
      await unlink(oldPath).catch(() => {});
    }
  }

  const filename = `qr-${method}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(dir, filename), Buffer.from(bytes));

  const url = `/payments/${filename}`;
  return NextResponse.json({ ok: true, method, url });
}
