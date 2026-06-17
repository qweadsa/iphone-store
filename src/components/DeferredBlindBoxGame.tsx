"use client";

import dynamic from "next/dynamic";
import LazyWhenVisible from "@/components/LazyWhenVisible";
import type { BlindBoxPrize } from "@/types/blindbox";

const BlindBoxGame = dynamic(() => import("@/components/BlindBoxGame"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex h-[320px] max-w-4xl items-center justify-center text-sm text-white/40">
      Loading...
    </div>
  ),
});

type Props = {
  prizes: BlindBoxPrize[];
  config: {
    price: number;
    grandPrizeName: string;
  };
};

export default function DeferredBlindBoxGame({ prizes, config }: Props) {
  return (
    <LazyWhenVisible minHeight={320} rootMargin="320px 0px">
      <BlindBoxGame prizes={prizes} config={config} theme="dark" />
    </LazyWhenVisible>
  );
}
