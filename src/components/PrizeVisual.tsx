"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getResponsiveRasterUrl } from "@/lib/raster-image-url";

type Props = {
  imageUrl?: string | null;
  emoji: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "reel";
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: { box: "h-12 w-12", emoji: "text-2xl", img: 48 },
  md: { box: "h-16 w-16", emoji: "text-3xl", img: 64 },
  lg: { box: "h-20 w-20", emoji: "text-4xl", img: 80 },
  reel: { box: "h-[72px] w-[72px]", emoji: "text-4xl", img: 72 },
} as const;

export default function PrizeVisual({
  imageUrl,
  emoji,
  alt,
  size = "md",
  className = "",
  priority = false,
}: Props) {
  const s = SIZE[size];
  const rawUrl = imageUrl?.trim() ?? "";
  const [src, setSrc] = useState(() =>
    rawUrl ? getResponsiveRasterUrl(rawUrl, s.img) : "",
  );

  useEffect(() => {
    if (!rawUrl) {
      setSrc("");
      return;
    }
    setSrc(getResponsiveRasterUrl(rawUrl, s.img));
  }, [rawUrl, s.img]);

  if (rawUrl && src) {
    const isSvg = rawUrl.endsWith(".svg");
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl ${s.box} ${className} ${
          isSvg ? "" : "bg-white/95 ring-1 ring-black/5"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          width={s.img}
          height={s.img}
          sizes={`${s.img}px`}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className={`h-full w-full object-contain p-1 ${isSvg ? "" : "drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"}`}
          unoptimized={isSvg}
          onError={() => {
            if (src !== rawUrl) setSrc(rawUrl);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-black/30 ${s.box} ${className}`}
    >
      <span className={s.emoji}>{emoji}</span>
    </div>
  );
}
