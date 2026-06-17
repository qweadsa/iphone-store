"use client";

import { useEffect, useMemo, useState } from "react";
import type { HeroShowcaseFrame } from "@/lib/hero-iphone-cutouts";
import {
  HERO_SHOWCASE_FRAMES,
  HERO_SHOWCASE_INTERVAL_MS,
} from "@/lib/hero-iphone-cutouts";

type Props = {
  alt: string;
  frames?: HeroShowcaseFrame[];
};

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.src}
                  alt={`${alt} — ${frame.label}`}
                  width={560}
                  height={720}
                  className="hero-phone-img"
                  loading={index === 0 ? "eager" : "lazy"}
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
