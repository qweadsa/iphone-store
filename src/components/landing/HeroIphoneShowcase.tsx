"use client";

import Image from "next/image";
import { HERO_CUTOUT_FRAMES, type HeroShowcaseFrame } from "@/lib/hero-iphone-cutouts";

type Props = {
  alt: string;
  frames?: HeroShowcaseFrame[];
};

function padShowcaseFrames(frames: HeroShowcaseFrame[]): HeroShowcaseFrame[] {
  if (frames.length === 0) return HERO_CUTOUT_FRAMES;
  if (frames.length >= 4) return frames.slice(0, 4);
  const padded = [...frames];
  while (padded.length < 4) {
    padded.push(frames[padded.length % frames.length]);
  }
  return padded;
}

export default function HeroIphoneShowcase({ alt, frames }: Props) {
  const displayFrames = padShowcaseFrames(frames?.length ? frames : HERO_CUTOUT_FRAMES);

  return (
    <div className="hero-phone-stage" role="img" aria-label={alt}>
      <div className="hero-phone-ambient" aria-hidden />
      <div className="hero-phone-ring" aria-hidden />
      <div className="hero-phone-spotlight" aria-hidden />
      <div className="hero-phone-shadow" aria-hidden />

      <div className="hero-phone-tilt">
        <div className="hero-phone-sway">
          <div className="hero-phone-stack">
            {displayFrames.map((frame, index) => (
              <div
                key={`${frame.src}-${index}`}
                className={`hero-phone-frame hero-phone-frame-${index + 1}${frame.wide ? " hero-phone-frame-wide" : ""}`}
              >
                <Image
                  src={frame.src}
                  alt={`${alt} — ${frame.label}`}
                  width={560}
                  height={720}
                  className="hero-phone-img"
                  priority={index <= 1}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
