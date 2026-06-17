"use client";

import { useEffect, useMemo, useState } from "react";
import OptimizedRasterImage from "@/components/OptimizedRasterImage";
import type { HeroShowcaseFrame } from "@/lib/hero-iphone-cutouts";
import {
  HERO_SHOWCASE_FRAMES,
  HERO_SHOWCASE_INTERVAL_MS,
} from "@/lib/hero-iphone-cutouts";
import {
  HERO_IMAGE_DISPLAY_HEIGHT,
  HERO_IMAGE_DISPLAY_WIDTH,
} from "@/lib/hero-image-url";

type Props = {
  alt: string;
  frames?: HeroShowcaseFrame[];
};

function initialLoadedIndices(slideCount: number, mobile: boolean): Set<number> {
  if (slideCount <= 1) return new Set([0]);
  return new Set(mobile ? [0] : [0, 1]);
}

export default function HeroIphoneShowcase({ alt, frames = HERO_SHOWCASE_FRAMES }: Props) {
  const slides = frames.length ? frames : HERO_SHOWCASE_FRAMES;
  const slideKey = useMemo(
    () => slides.map((frame) => frame.src).join("|"),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, HERO_SHOWCASE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    setLoadedIndices(initialLoadedIndices(slides.length, mobile));
  }, [slideKey, slides.length]);

  useEffect(() => {
    const next = (activeIndex + 1) % slides.length;
    setLoadedIndices((prev) => {
      if (prev.has(activeIndex) && prev.has(next)) return prev;
      const copy = new Set(prev);
      copy.add(activeIndex);
      copy.add(next);
      return copy;
    });
  }, [activeIndex, slides.length]);

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
                {loadedIndices.has(index) ? (
                  <OptimizedRasterImage
                    src={frame.src}
                    alt={`${alt} — ${frame.label}`}
                    width={HERO_IMAGE_DISPLAY_WIDTH}
                    height={HERO_IMAGE_DISPLAY_HEIGHT}
                    className="hero-phone-img"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding="async"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
