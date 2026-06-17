export type HeroShowcaseFrame = {
  src: string;
  label: string;
  wide?: boolean;
};

/** 首屏大奖轮播图（透明底 PNG） */
export const HERO_SHOWCASE_FRAMES: HeroShowcaseFrame[] = [
  { src: "/hero/showcase-01-iphone-white.png", label: "iPhone White", wide: true },
  { src: "/hero/showcase-02-iphone-blue.png", label: "iPhone Blue", wide: true },
  { src: "/hero/showcase-03-iphone-orange-dual.png", label: "iPhone Orange", wide: true },
  { src: "/hero/showcase-04-iphone-orange-angle.png", label: "iPhone Side" },
  { src: "/hero/showcase-05-ipad-pro.png", label: "iPad Pro", wide: true },
  { src: "/hero/showcase-06-macbook-pro.png", label: "MacBook Pro", wide: true },
  { src: "/hero/showcase-07-gaming-pc.png", label: "Gaming PC", wide: true },
];

/** 每张图停留时间（毫秒）— 比原先 16s/4 张 ≈ 4s 更快 */
export const HERO_SHOWCASE_INTERVAL_MS = 2400;

/** @deprecated 保留旧名兼容 */
export const HERO_CUTOUT_FRAMES = HERO_SHOWCASE_FRAMES;
export const HERO_PRIMARY_CUTOUT = HERO_SHOWCASE_FRAMES[0].src;
