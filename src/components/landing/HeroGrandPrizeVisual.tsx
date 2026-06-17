"use client";

type Props = {
  alt: string;
  imageUrl?: string | null;
  emoji?: string;
};

/** 大奖区单图展示（与左侧标题一致，不用轮播） */
export default function HeroGrandPrizeVisual({ alt, imageUrl, emoji = "🏆" }: Props) {
  return (
    <div className="hero-phone-stage" role="img" aria-label={alt}>
      <div className="hero-phone-ambient" aria-hidden />
      <div className="hero-phone-ring" aria-hidden />
      <div className="hero-phone-spotlight" aria-hidden />
      <div className="hero-phone-shadow" aria-hidden />

      <div className="hero-phone-tilt">
        <div className="hero-phone-sway">
          <div className="hero-phone-stack">
            <div className="hero-phone-frame opacity-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={alt}
                  width={560}
                  height={720}
                  className="hero-phone-img"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-[24px] border border-white/15 bg-gradient-to-b from-white/10 to-black/30">
                  <span className="text-6xl">{emoji}</span>
                  <span className="mt-3 max-w-[160px] text-center text-xs text-white/45">{alt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
