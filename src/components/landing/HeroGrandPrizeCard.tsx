import HeroIphoneShowcase from "@/components/landing/HeroIphoneShowcase";
import type { GrandPrizeStatus } from "@/lib/blindbox-public";

type Props = {
  name: string;
  value: string;
  imageUrl?: string | null;
  status: GrandPrizeStatus;
  statusLabel: string;
  labels: {
    eyebrow: string;
    subtitle: string;
    winBadge: string;
  };
  floatingChips?: { label: string; emoji: string; className: string }[];
};

export default function HeroGrandPrizeCard({
  name,
  value,
  imageUrl,
  status,
  statusLabel,
  labels,
  floatingChips = [],
}: Props) {
  return (
    <div className="relative">
      {floatingChips.map((chip) => (
        <div
          key={chip.label}
          className={`chip-float pointer-events-none absolute z-10 hidden items-center gap-1.5 rounded-full border border-[#FFB800]/35 bg-[rgba(3,3,10,0.55)] px-3 py-1.5 text-[11px] font-semibold text-[#F5F5F7] shadow-lg backdrop-blur-md lg:flex ${chip.className}`}
        >
          <span>{chip.emoji}</span>
          <span className="whitespace-nowrap">{chip.label}</span>
        </div>
      ))}

      <div
        className="relative min-h-[300px] rounded-[30px] border border-[#FFB800]/32 shadow-[0_30px_90px_rgba(255,122,0,0.22)] sm:min-h-[320px] lg:min-h-[360px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,184,0,0.18), rgba(255,45,45,0.16), rgba(255,255,255,0.05))",
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
          <div className="absolute -right-8 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,184,0,0.35)_0%,transparent_70%)]" />
          <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,45,45,0.25)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_48%,rgba(255,122,0,0.16)_0%,transparent_58%)]" />
        </div>

        <div className="relative flex h-full min-h-[260px] flex-col gap-4 p-5 sm:min-h-[280px] lg:min-h-[300px] lg:flex-row lg:items-stretch lg:gap-2">
          <div className="relative z-[1] flex flex-col justify-between py-0.5 lg:flex-[0.46] lg:pr-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFB800] sm:text-[11px]">
                {labels.eyebrow}
              </p>
              <h3 className="mt-2 text-xl font-black leading-tight text-[#F5F5F7] sm:text-2xl lg:text-[28px]">
                {name}
              </h3>
              <p className="mt-1.5 text-[12px] text-white/55 sm:text-[13px]">{labels.subtitle}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <p className="text-[26px] font-black text-[#FFB800] sm:text-[32px]">{value}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${
                  status === "claimed"
                    ? "bg-white/10 text-white/60"
                    : "bg-[#FFB800]/15 text-[#FFB800]"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="relative flex min-h-[260px] flex-1 items-center justify-center py-1 lg:min-h-[300px] lg:flex-[0.54] lg:py-2">
            <div className="absolute right-0 top-0 z-20 rounded-full bg-gradient-to-r from-[#FF2D2D] to-[#FF7A00] px-3 py-1 text-[10px] font-black tracking-wider text-white shadow-lg">
              {labels.winBadge}
            </div>
            <HeroIphoneShowcase alt={name} />
          </div>
        </div>
      </div>
    </div>
  );
}
