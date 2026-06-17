"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { IMAGE_UPLOAD_MAX_BYTES } from "@/lib/image-upload-shared";
import type { HeroShowcaseEntry } from "@/lib/hero-showcase";

type Props = {
  value: HeroShowcaseEntry[];
  onChange: (frames: HeroShowcaseEntry[]) => void;
};

export default function HeroShowcaseEditor({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setError("");
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      setError("图片不能超过 8MB");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      onChange([...value, { src: data.url, wide: true }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateFrame(index: number, patch: Partial<HeroShowcaseEntry>) {
    onChange(value.map((frame, i) => (i === index ? { ...frame, ...patch } : frame)));
  }

  function removeFrame(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveFrame(index: number, delta: number) {
    const next = index + delta;
    if (next < 0 || next >= value.length) return;
    const copy = [...value];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  }

  function addUrlRow() {
    onChange([...value, { src: "", wide: true }]);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-white/80">
        首页轮播图（右侧大奖展示）
      </label>
      <p className="mb-3 text-xs text-white/40">
        可上传多张透明底 PNG，按顺序自动轮播。建议 512×512 以上。上传或改 URL 后务必点「保存盲盒设置」。
      </p>

      <div className="space-y-3">
        {value.map((frame, index) => (
          <div
            key={`${frame.src}-${index}`}
            className="rounded-xl border border-white/10 bg-black/20 p-3"
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                {frame.src ? (
                  <Image
                    src={frame.src}
                    alt={`slide-${index + 1}`}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <span className="text-[10px] text-white/30">暂无</span>
                )}
              </div>

              <div className="min-w-[200px] flex-1 space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>#{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveFrame(index, -1)}
                    disabled={index === 0}
                    className="rounded bg-white/10 px-2 py-0.5 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFrame(index, 1)}
                    disabled={index === value.length - 1}
                    className="rounded bg-white/10 px-2 py-0.5 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFrame(index)}
                    className="ml-auto text-red-400 hover:underline"
                  >
                    删除
                  </button>
                </div>
                <input
                  type="text"
                  value={frame.src}
                  onChange={(e) => updateFrame(index, { src: e.target.value })}
                  placeholder="图片 URL，例如 /uploads/xxx.png 或 /hero/showcase-01.png"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
                />
                <input
                  type="text"
                  value={frame.label ?? ""}
                  onChange={(e) => updateFrame(index, { label: e.target.value })}
                  placeholder="备注（可选，仅后台识别）"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {uploading ? "上传中..." : "+ 上传一张"}
        </button>
        <button
          type="button"
          onClick={addUrlRow}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
        >
          + 粘贴 URL
        </button>
      </div>

      {value.length === 0 && (
        <p className="mt-2 text-xs text-amber-400/90">
          未配置时使用代码内置默认轮播（public/hero/showcase-*.png）。上传后会覆盖默认轮播。
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
