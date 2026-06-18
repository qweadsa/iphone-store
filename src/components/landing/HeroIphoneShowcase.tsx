"use client";

import Image from "next/image";
import { HERO_CUTOUT_FRAMES } from "@/lib/hero-iphone-cutouts";

type Props = {
  alt: string;
};

export default function HeroIphoneShowcase({ alt }: Props) {
  return (
    <div className="hero-phone-stage" role="img" aria-label={alt}>
      <div className="hero-phone-ambient" aria-hidden />
      <div className="hero-phone-ring" aria-hidden />
      <div className="hero-phone-spotlight" aria-hidden />
      <div className="hero-phone-shadow" aria-hidden />

      <div className="hero-phone-tilt">
        <div className="hero-phone-sway">
          <div className="hero-phone-stack">
            {HERO_CUTOUT_FRAMES.map((frame, index) => (
              <div
                key={frame.src}
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
