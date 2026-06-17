import Image from "next/image";

type Props = {
  imageUrl?: string | null;
  emoji: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "reel";
  className?: string;
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
}: Props) {
  const s = SIZE[size];

  if (imageUrl) {
    const isSvg = imageUrl.endsWith(".svg");
    return (
      <div
        className={`relative shrink-0 overflow-visible ${s.box} ${className}`}
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={s.img}
          height={s.img}
          className={`h-full w-full object-contain p-1 ${isSvg ? "" : "prize-cutout-img drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"}`}
          unoptimized={isSvg}
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
