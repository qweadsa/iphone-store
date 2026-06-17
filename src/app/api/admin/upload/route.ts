import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { imageExtFromFile, saveImageToPublic } from "@/lib/save-image";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "请选择图片" }, { status: 400 });
  }

  try {
    const ext = imageExtFromFile(file) ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const url = await saveImageToPublic(file, "uploads", filename, {
      removeLightBackground: true,
    });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "上传失败" },
      { status: 400 },
    );
  }
}
