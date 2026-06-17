"use client";

import { useEffect, useState } from "react";

type Labels = {
  label: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
};

function getEndOfDay(): number {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}

export default function CountdownTimer({ labels }: { labels: Labels }) {
  const [target, setTarget] = useState(getEndOfDay);
  const [left, setLeft] = useState(() => getTimeLeft(getEndOfDay()));

  useEffect(() => {
    const tick = () => {
      const t = getTimeLeft(target);
      if (t.done) {
        const next = getEndOfDay();
        setTarget(next);
        setLeft(getTimeLeft(next));
      } else {
        setLeft(t);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { value: left.days, label: labels.days },
    { value: left.hours, label: labels.hours },
    { value: left.mins, label: labels.mins },
    { value: left.secs, label: labels.secs },
  ];

  return (
    <div className="mt-6">
      <p className="text-xs font-medium uppercase tracking-widest text-amber-400/80">
        {labels.label}
      </p>
      <div className="mt-3 flex justify-center gap-2 sm:gap-3 lg:justify-start">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex min-w-[3.5rem] flex-col items-center rounded-xl border border-amber-400/20 bg-amber-500/10 px-2 py-2 sm:min-w-[4rem] sm:px-3"
          >
            <span className="text-xl font-black tabular-nums text-amber-300 sm:text-2xl">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[10px] uppercase text-white/50">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
