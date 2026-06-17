"use client";

import { useEffect, useMemo, useState } from "react";
import OptimizedRasterImage from "@/components/OptimizedRasterImage";
import type { HeroShowcaseFrame } from "@/lib/hero-iphone-cutouts";
import {
  HERO_SHOWCASE_FRAMES,
  HERO_SHOWCASE_INTERVAL_MS,
} from "@/lib/hero-iphone-cutouts";
import {
  getHeroMobileWebpUrl,
  getHeroWebpUrl,
  HERO_IMAGE_DISPLAY_HEIGHT,
  HERO_IMAGE_DISPLAY_WIDTH,
  isLocalRasterPng,
} from "@/lib/hero-image-url";

type Props = {
  alt: string;
  frames?: HeroShowcaseFrame[];
};

function prefetchSlide(src: string) {
  if (typeof window === "undefined") return;
  const url = isLocalRasterPng(src)
    ? window.matchMedia("(max-width: 768px)").matches
      ? getHeroMobileWebpUrl(src)
      : getHeroWebpUrl(src)
    : src;
  const img = new window.Image();
  img.decoding = "async";
  img.src = url;
}

export default function HeroIphoneShowcase({ alt, frames = HERO_SHOWCASE_FRAMES }: Props) {
  const slides = frames.length ? frames : HERO_SHOWCASE_FRAMES;
  const slideKey = useMemo(
    () => slides.map((frame) => frame.src).join("|"),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, HERO_SHOWCASE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [slideKey]);

  // 后台预加载其余轮播图，切换时不卡顿，DOM 仍保留全部图片
  useEffect(() => {
    slides.forEach((frame, index) => {
      if (index === 0) return;
      prefetchSlide(frame.src);
    });
  }, [slides]);

  useEffect(() => {
    const next = (activeIndex + 1) % slides.length;
    prefetchSlide(slides[next]?.src ?? "");
  }, [activeIndex, slides]);

  return (
    <div className="hero-phone-stage" role="img" aria-label={alt}>
      <div className="hero-phone-ambient" aria-hidden />
      <div className="hero-phone-ring" aria-hidden />
      <div className="hero-phone-spotlight" aria-hidden />
      <div className="hero-phone-shadow" aria-hidden />

      <div className="hero-phone-tilt">
        <div className="hero-phone-sway">
          <div className="hero-phone-stack">
            {slides.map((frame, index) => (
              <div
                key={frame.src}
                className={`hero-phone-frame transition-opacity duration-500 ease-in-out${
                  index === activeIndex ? " opacity-100" : " opacity-0"
                }${frame.wide ? " hero-phone-frame-wide" : ""}`}
              >
                <OptimizedRasterImage
                  src={frame.src}
                  alt={`${alt} — ${frame.label}`}
                  width={HERO_IMAGE_DISPLAY_WIDTH}
                  height={HERO_IMAGE_DISPLAY_HEIGHT}
                  className="hero-phone-img"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
