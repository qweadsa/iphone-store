"use client";

type Props = { active: boolean };

export default function GrandConfetti({ active }: Props) {
  if (!active) return null;

  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${(i * 13 + 7) % 100}%`,
    delay: `${(i % 7) * 0.08}s`,
    color: i % 3 === 0 ? "#FFB800" : i % 3 === 1 ? "#FF7A00" : "#FF2D2D",
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 h-2 w-1.5 rounded-sm opacity-90"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
