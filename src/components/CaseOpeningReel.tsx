"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  REEL_ITEM_STEP,
  REEL_ITEM_WIDTH,
  REEL_SPIN_COUNT,
  REEL_TIER_STYLES,
  REEL_WINNER_INDEX,
  buildSpinSequence,
  type ReelItem,
} from "@/lib/case-reel-items";
import PrizeVisual from "@/components/PrizeVisual";

type Phase = "idle" | "spinning" | "done";

type Props = {
  pool: ReelItem[];
  phase: Phase;
  winner: ReelItem | null;
  spinTrigger?: number;
  onSpinComplete?: () => void;
};

function ReelCard({ item, active }: { item: ReelItem; active?: boolean }) {
  if (!item) return null;
  const style = REEL_TIER_STYLES[item.tier] ?? REEL_TIER_STYLES.uncommon;
  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border bg-[#0a0a12]/90 px-2 py-3 backdrop-blur-sm transition-all duration-300 ${style.border} ${active ? `${style.glow} scale-105 border-2` : ""}`}
      style={{ width: REEL_ITEM_WIDTH, height: 132 }}
    >
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent ${item.tier === "legendary" ? "via-[#FFB800]" : item.tier === "epic" ? "via-[#A855F7]" : "via-[#3B82F6]"} to-transparent opacity-80`}
      />
      <PrizeVisual
        imageUrl={item.imageUrl}
        emoji={item.emoji}
        alt={item.name}
        size="reel"
        className="shadow-lg"
      />
      <p className="mt-2 line-clamp-2 w-full px-1 text-center text-[11px] font-bold leading-tight text-[#F5F5F7]">
        {item.name}
      </p>
      <p className={`mt-0.5 line-clamp-1 text-[9px] ${style.label}`}>{item.subtitle}</p>
    </div>
  );
}

export default function CaseOpeningReel({
  pool,
  phase,
  winner,
  spinTrigger = 0,
  onSpinComplete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef(pool);
  const winnerRef = useRef(winner);
  const onCompleteRef = useRef(onSpinComplete);
  const spinTokenRef = useRef(0);

  const [offset, setOffset] = useState(0);
  const [spinSequence, setSpinSequence] = useState<ReelItem[]>([]);
  const [transition, setTransition] = useState(false);

  poolRef.current = pool;
  winnerRef.current = winner;
  onCompleteRef.current = onSpinComplete;

  const idleTrack = useMemo(() => {
    if (pool.length === 0) return [];
    return [...pool, ...pool];
  }, [pool]);

  const calcCenterOffset = useCallback((index: number) => {
    const w = containerRef.current?.offsetWidth ?? 640;
    return Math.max(0, index * REEL_ITEM_STEP - (w - REEL_ITEM_WIDTH) / 2);
  }, []);

  useEffect(() => {
    if (phase === "idle") {
      setSpinSequence([]);
      setOffset(0);
      setTransition(false);
    }
  }, [phase]);

  useEffect(() => {
    const currentWinner = winnerRef.current;
    if (phase !== "spinning" || !currentWinner) return;

    const currentPool = poolRef.current;
    if (currentPool.length === 0) return;

    const token = ++spinTokenRef.current;
    const seq = buildSpinSequence(currentPool, currentWinner, REEL_SPIN_COUNT, REEL_WINNER_INDEX);
    setSpinSequence(seq);
    setTransition(false);
    setOffset(0);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (spinTokenRef.current !== token) return;
        setTransition(true);
        setOffset(calcCenterOffset(REEL_WINNER_INDEX));
      });
    });

    const timer = window.setTimeout(() => {
      if (spinTokenRef.current !== token) return;
      onCompleteRef.current?.();
    }, 4800);

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      clearTimeout(timer);
    };
  }, [phase, spinTrigger, calcCenterOffset]);

  useEffect(() => {
    if (phase === "done" && spinSequence.length > 0) {
      setTransition(false);
      setOffset(calcCenterOffset(REEL_WINNER_INDEX));
    }
  }, [phase, spinSequence.length, calcCenterOffset]);

  const showIdle = phase === "idle" && pool.length > 0;
  const showSpin = (phase === "spinning" || phase === "done") && spinSequence.length > 0;
  const showWaiting = phase === "spinning" && spinSequence.length === 0 && pool.length > 0;

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="h-0 w-0 border-x-[10px] border-t-[12px] border-x-transparent border-t-[#FFB800]" />
          <div className="h-[148px] w-0.5 bg-gradient-to-b from-[#FFB800] via-[#FF7A00] to-transparent opacity-90" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="h-[148px] w-0.5 bg-gradient-to-t from-[#FFB800] via-[#FF7A00] to-transparent opacity-90" />
          <div className="h-0 w-0 border-x-[10px] border-b-[12px] border-x-transparent border-b-[#FFB800]" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050507]/95 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"
        style={{ height: 168 }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#03030A] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#03030A] to-transparent sm:w-24" />

        {showIdle && (
          <div className="absolute inset-y-0 flex items-center">
            <div className="reel-idle-scroll flex gap-2.5 py-4 pl-4">
              {idleTrack.map((item, i) => (
                <ReelCard key={`idle-${item.id}-${i}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {showWaiting && (
          <div className="absolute inset-y-0 flex items-center">
            <div className="reel-idle-scroll flex gap-2.5 py-4 pl-4 opacity-70">
              {idleTrack.map((item, i) => (
                <ReelCard key={`wait-${item.id}-${i}`} item={item} />
              ))}
            </div>
          </div>
        )}

        {showSpin && (
          <div className="absolute inset-y-0 flex items-center">
            <div
              className="flex gap-2.5 py-4 pl-4 will-change-transform"
              style={{
                transform: `translate3d(-${offset}px, 0, 0)`,
                transition: transition
                  ? "transform 4.6s cubic-bezier(0.12, 0.75, 0.18, 1)"
                  : "none",
              }}
            >
              {spinSequence.map((item, i) => (
                <ReelCard
                  key={item.id}
                  item={item}
                  active={phase === "done" && i === REEL_WINNER_INDEX}
                />
              ))}
            </div>
          </div>
        )}

        {pool.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            Loading prizes...
          </div>
        )}
      </div>
    </div>
  );
}
