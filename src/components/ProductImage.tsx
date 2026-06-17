type Props = {
  productId: string;
  color?: string;
  name: string;
  className?: string;
  priority?: boolean;
};

function phonePaths(id: string) {
  const compact = id === "iphone-se";
  const large =
    id === "iphone-17-pro-max" ||
    id === "iphone-17-plus";
  const pro = id.includes("pro");

  return {
    w: compact ? 120 : large ? 168 : 148,
    h: compact ? 220 : large ? 320 : 300,
    rx: compact ? 22 : 28,
    island: !compact,
    cameraBump: pro,
    compact,
  };
}

export default function ProductImage({
  productId,
  color = "#BFA48F",
  name,
  className = "",
}: Props) {
  const { w, h, rx, island, cameraBump, compact } = phonePaths(productId);
  const x = (200 - w) / 2;
  const y = (360 - h) / 2;

  return (
    <svg
      viewBox="0 0 200 360"
      role="img"
      aria-label={name}
      className={className}
    >
      <defs>
        <linearGradient id={`body-${productId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={shade(color, -30)} />
        </linearGradient>
        <linearGradient id={`screen-${productId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f0f1a" />
        </linearGradient>
        <filter id={`shadow-${productId}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.25" />
        </filter>
      </defs>

      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={`url(#body-${productId})`}
        filter={`url(#shadow-${productId})`}
      />

      <rect
        x={x + 4}
        y={y + (compact ? 28 : 36)}
        width={w - 8}
        height={h - (compact ? 52 : 60)}
        rx={rx - 4}
        fill={`url(#screen-${productId})`}
      />

      {island && (
        <rect
          x={100 - (compact ? 0 : 22)}
          y={y + 14}
          width={44}
          height={12}
          rx={6}
          fill="#000"
        />
      )}

      {compact && (
        <circle cx={100} cy={y + h - 24} r={14} fill="#111" stroke="#333" strokeWidth="1.5" />
      )}

      {cameraBump && (
        <g>
          <rect
            x={x + w - 36}
            y={y + 18}
            width={28}
            height={28}
            rx={8}
            fill={shade(color, -20)}
            opacity={0.9}
          />
          <circle cx={x + w - 22} cy={y + 32} r={6} fill="#222" />
          <circle cx={x + w - 22} cy={y + 32} r={3} fill="#444" />
        </g>
      )}

      <rect
        x={x + 8}
        y={y + (compact ? 40 : 52)}
        width={w - 16}
        height={h - (compact ? 72 : 88)}
        rx={4}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
