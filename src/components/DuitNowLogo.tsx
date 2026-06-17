type Props = { className?: string; size?: number };

/** Stylised DuitNow mark (pink D) — for payment UI branding */
export default function DuitNowLogo({ className = "", size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.95" />
      <path
        d="M14 12h12c8.837 0 16 7.163 16 16s-7.163 16-16 16H14V12z"
        fill="#ED0677"
      />
      <path
        d="M22 20h4c3.314 0 6 2.686 6 6s-2.686 6-6 6h-4V20z"
        fill="white"
      />
    </svg>
  );
}
