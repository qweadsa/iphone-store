import {
  HERO_SHOWCASE_FRAMES,
  type HeroShowcaseFrame,
} from "@/lib/hero-iphone-cutouts";

export type HeroShowcaseEntry = {
  src: string;
  label?: string;
  wide?: boolean;
};

export function parseHeroShowcaseJson(raw: unknown): HeroShowcaseEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        return { src: item.trim() } satisfies HeroShowcaseEntry;
      }
      if (
        item &&
        typeof item === "object" &&
        "src" in item &&
        typeof (item as HeroShowcaseEntry).src === "string"
      ) {
        const entry = item as HeroShowcaseEntry;
        const src = entry.src.trim();
        if (!src) return null;
        return {
          src,
          label: entry.label?.trim() || undefined,
          wide: entry.wide ?? undefined,
        } satisfies HeroShowcaseEntry;
      }
      return null;
    })
    .filter((item): item is HeroShowcaseEntry => item !== null);
}

export function serializeHeroShowcase(frames: HeroShowcaseEntry[]): HeroShowcaseEntry[] {
  return frames
    .filter((frame) => frame.src.trim())
    .map((frame) => ({
      src: frame.src.trim(),
      ...(frame.label?.trim() ? { label: frame.label.trim() } : {}),
      ...(frame.wide ? { wide: true } : {}),
    }));
}

export function resolveHeroShowcaseFrames(
  configFrames: HeroShowcaseEntry[] | null | undefined,
): HeroShowcaseFrame[] {
  if (configFrames?.length) {
    return configFrames.map((frame, index) => ({
      src: frame.src,
      label: frame.label ?? `Slide ${index + 1}`,
      wide: frame.wide ?? true,
    }));
  }
  return HERO_SHOWCASE_FRAMES;
}
