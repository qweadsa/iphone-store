export type HeroShowcaseFrame = {
  src: string;
  label: string;
  wide?: boolean;
};

export const HERO_CUTOUT_FRAMES: HeroShowcaseFrame[] = [
  { src: "/hero/iphone-cutout-front-alpha.png", label: "front" },
  { src: "/hero/iphone-cutout-angle-alpha.png", label: "angle" },
  { src: "/hero/iphone-cutout-back-alpha.png", label: "back" },
  { src: "/hero/iphone-cutout-dual-alpha.png", label: "dual", wide: true },
];

export const HERO_SHOWCASE_FRAMES = HERO_CUTOUT_FRAMES;

export const HERO_PRIMARY_CUTOUT = HERO_CUTOUT_FRAMES[1].src;
