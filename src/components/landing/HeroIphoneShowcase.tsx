"use client";

import { useEffect, useMemo, useState } from "react";
import type { HeroShowcaseFrame } from "@/lib/hero-iphone-cutouts";
import {
  HERO_SHOWCASE_FRAMES,
  HERO_SHOWCASE_INTERVAL_MS,
} from "@/lib/hero-iphone-cutouts";
import {
  getHeroWebpUrl,
  HERO_IMAGE_DISPLAY_HEIGHT,
  HERO_IMAGE_DISPLAY_WIDTH,
  heroSupportsWebp,
} from "@/lib/hero-image-url";

type Props = {
  alt: string;
  frames?: HeroShowcaseFrame[];
};

function HeroSlideImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const webp = getHeroWebpUrl(src);
  const useWebp = heroSupportsWebp(src);

  return (
    <picture>
      {useWebp ? <source srcSet={webp} type="image/webp" /> : null}
      <img
        src={src}
        alt={alt}
        width={HERO_IMAGE_DISPLAY_WIDTH}
        height={HERO_IMAGE_DISPLAY_HEIGHT}
        className="hero-phone-img"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
      />
    </picture>
  );
}

export default function HeroIphoneShowcase({ alt, frames = HERO_SHOWCASE_FRAMES }: Props) {
  const slides = frames.length ? frames : HERO_SHOWCASE_FRAMES;
  const slideKey = useMemo(
    () => slides.map((frame) => frame.src).join("|"),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set([0, 1]));

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, HERO_SHOWCASE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setActiveIndex(0);
    setLoadedIndices(new Set(slides.length > 1 ? [0, 1] : [0]));
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
                  <HeroSlideImage
                    src={frame.src}
                    alt={`${alt} — ${frame.label}`}
                    priority={index === 0}
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
