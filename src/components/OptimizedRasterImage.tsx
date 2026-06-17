"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";
import {
  getHeroMobileWebpUrl,
  getHeroWebpUrl,
  isLocalRasterPng,
} from "@/lib/hero-image-url";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** Prize thumbnails etc. — always use the smallest WebP variant */
  thumbnail?: boolean;
};

function pickOptimizedSrc(src: string, thumbnail: boolean): string {
  if (!isLocalRasterPng(src)) return src;
  if (thumbnail) return getHeroMobileWebpUrl(src);
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  return mobile ? getHeroMobileWebpUrl(src) : getHeroWebpUrl(src);
}

export default function OptimizedRasterImage({
  src,
  thumbnail = false,
  onError,
  className,
  width,
  height,
  ...props
}: Props) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!isLocalRasterPng(src)) {
      setCurrentSrc(src);
      return;
    }

    setCurrentSrc(pickOptimizedSrc(src, thumbnail));

    if (thumbnail) return;

    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setCurrentSrc(pickOptimizedSrc(src, false));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [src, thumbnail]);

  if (!currentSrc) {
    return (
      <div
        className={className}
        style={{ width, height }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local WebP with PNG fallback
    <img
      {...props}
      alt={props.alt ?? ""}
      src={currentSrc}
      width={width}
      height={height}
      className={className}
      onError={(event) => {
        if (currentSrc !== src && isLocalRasterPng(src)) {
          setCurrentSrc(src);
          return;
        }
        onError?.(event);
      }}
    />
  );
}
