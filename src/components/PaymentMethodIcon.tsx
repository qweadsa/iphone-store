import type { PaymentMethodId } from "@/lib/payments/methods";

type Props = {
  method: PaymentMethodId;
  className?: string;
  large?: boolean;
};

function Shell({
  children,
  className = "",
  bg = "bg-white",
  large = false,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: string;
  large?: boolean;
}) {
  return (
    <span
      className={`flex w-full items-center justify-center overflow-hidden rounded-lg border border-black/10 ${bg} ${
        large ? "min-h-[56px] px-2 py-2" : "min-h-[48px] px-1"
      } ${className}`}
    >
      {children}
    </span>
  );
}

export default function PaymentMethodIcon({
  method,
  className = "",
  large = false,
}: Props) {
  const textSize = large ? "text-[11px]" : "text-[9px]";

  switch (method) {
    case "duitnow":
      return (
        <Shell className={className} bg="bg-[#e6007e]" large={large}>
          <span className={`font-bold text-center leading-tight text-white ${large ? "text-[13px]" : "text-[11px]"}`}>
            DuitNow
            <br />
            QR
          </span>
        </Shell>
      );
    case "tng":
      return (
        <Shell className={className} bg="bg-[#0057e7]" large={large}>
          <span
            className={`font-black leading-tight text-center text-white ${textSize}`}
          >
            Touch
            <br />
            &apos;n Go
          </span>
        </Shell>
      );
    case "grabpay":
      return (
        <Shell className={className} bg="bg-[#00b14f]" large={large}>
          <span className={`font-bold text-white ${large ? "text-sm" : "text-[11px]"}`}>
            GrabPay
          </span>
        </Shell>
      );
    case "shopeepay":
      return (
        <Shell className={className} bg="bg-[#ee4d2d]" large={large}>
          <span className={`font-bold text-white ${large ? "text-[11px]" : "text-[10px]"}`}>
            ShopeePay
          </span>
        </Shell>
      );
    case "paypal":
      return (
        <Shell className={className} large={large}>
          <span
            className={`font-bold leading-none text-[#003087] ${large ? "text-sm" : "text-[10px]"}`}
          >
            <span className="text-[#009cde]">Pay</span>Pal
          </span>
        </Shell>
      );
    case "visa":
      return (
        <Shell className={className} large={large}>
          <span
            className={`font-bold italic text-[#1a1f71] ${large ? "text-lg" : "text-[13px]"}`}
          >
            VISA
          </span>
        </Shell>
      );
    case "crypto":
      return (
        <Shell className={className} bg="bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" large={large}>
          <span
            className={`flex items-center gap-1 font-bold text-amber-400 ${large ? "text-sm" : "text-[10px]"}`}
          >
            <span className={large ? "text-xl" : "text-base"}>₿</span>
            <span className="text-white/90">Crypto</span>
          </span>
        </Shell>
      );
    case "balance":
      return (
        <Shell className={className} bg="bg-amber-50" large={large}>
          <span className="text-sm font-bold text-amber-700">余额</span>
        </Shell>
      );
    case "qr":
      return (
        <Shell className={className} bg="bg-gray-50" large={large}>
          <span className="text-[10px] font-bold text-gray-700">扫码</span>
        </Shell>
      );
    default:
      return (
        <Shell className={className} large={large}>
          <span className="text-[10px] font-bold text-gray-600">Pay</span>
        </Shell>
      );
  }
}
