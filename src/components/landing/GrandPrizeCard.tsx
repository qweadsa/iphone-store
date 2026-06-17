import Image from "next/image";

type Props = {
  name: string;
  value: string;
  imageUrl?: string | null;
  labels: {
    eyebrow: string;
    subtitle: string;
    winBadge: string;
  };
};

export default function GrandPrizeCard({ name, value, imageUrl, labels }: Props) {
  return (
    <div className="prize-float relative overflow-hidden rounded-[28px] border border-[#FFB800]/25 p-5 shadow-[0_24px_60px_rgba(255,90,31,0.18)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FFB800]/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FF5A1F]/30 via-[#03030A]/40 to-[#03030A]/90" />
      <div className="relative flex h-[200px] items-stretch gap-4 sm:h-[240px]">
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFB800]/90">
              {labels.eyebrow}
            </p>
            <h3 className="mt-2 text-[22px] font-black leading-tight text-[#F5F5F7] sm:text-2xl">
              {name}
            </h3>
            <p className="mt-1 text-[13px] text-white/55">{labels.subtitle}</p>
          </div>
          <p className="text-[28px] font-black text-[#FFB800]">{value}</p>
        </div>
        <div className="relative w-[120px] shrink-0 sm:w-[140px]">
          <div className="absolute right-0 top-0 rounded-full bg-[#FF2D2D] px-3 py-1 text-[10px] font-black tracking-wider text-white">
            {labels.winBadge}
          </div>
          <div className="flex h-full items-center justify-center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                width={140}
                height={180}
                className="max-h-[160px] w-auto object-contain drop-shadow-2xl"
                unoptimized
              />
            ) : (
              <div className="flex h-[140px] w-[72px] flex-col items-center justify-center rounded-[20px] border border-white/15 bg-gradient-to-b from-white/10 to-white/5 shadow-inner">
                <div className="h-[100px] w-[56px] rounded-[14px] border-2 border-white/20 bg-black/40" />
                <div className="mt-2 h-1 w-8 rounded-full bg-white/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
