"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { IMAGE_UPLOAD_MAX_BYTES } from "@/lib/image-upload-shared";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  /** 显示「自动去除白底」选项（默认开启抠图） */
  enableCutout?: boolean;
  defaultCutout?: boolean;
};

export default function ImageUpload({
  value,
  onChange,
  label = "图片",
  hint = "支持 JPG / PNG / WebP / GIF / SVG，最大 8MB。白底商品图默认自动抠成透明 PNG。",
  enableCutout = false,
  defaultCutout = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cutout, setCutout] = useState(defaultCutout);

  async function handleFile(file: File) {
    setError("");
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      setError("图片不能超过 8MB");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (enableCutout && !cutout) form.append("preserveOriginal", "1");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewBg = "bg-white";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-white/80">{label}</label>
      {hint && <p className="mb-2 text-xs text-white/40">{hint}</p>}
      {enableCutout && (
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={cutout}
            onChange={(e) => setCutout(e.target.checked)}
          />
          <span className="text-white/70">自动去除白底（输出白底 PNG，适合深色前台）</span>
        </label>
      )}
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 ${previewBg}`}
        >
          {value ? (
            <Image
              src={value}
              alt="preview"
              fill
              className="object-contain p-1"
              unoptimized
            />
          ) : (
            <span className="text-xs text-white/30">暂无图片</span>
          )}
        </div>
        <div className="flex min-w-[180px] flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {uploading ? "上传中..." : value ? "更换图片" : "上传图片"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-left text-xs text-red-400 hover:underline"
            >
              移除图片
            </button>
          )}
          {value && (
            <p className="break-all text-[11px] text-emerald-400/80">{value}</p>
          )}
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="或粘贴图片 URL，例如 /uploads/xxx.png"
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
