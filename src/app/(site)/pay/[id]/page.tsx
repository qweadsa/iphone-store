"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";

type PaymentInfo = {
  paymentId: string;
  amount: number;
  status: string;
  payUrl?: string;
};

function PayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { messages: m } = useI18n();
  const p = m.payment;

  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);
  const success = searchParams.get("success") === "1";

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/payments/${id}`);
      const data = await res.json();
      setInfo(data);
      setLoading(false);
      if (data.payUrl) {
        const QRCode = (await import("qrcode")).default;
        setQr(await QRCode.toDataURL(data.payUrl, { width: 240 }));
      }
    })();
  }, [id]);

  async function demoPay() {
    await fetch(`/api/payments/${id}/confirm-demo`, { method: "POST" });
    window.location.href = `/pay/${id}?success=1`;
  }

  if (loading) {
    return <p className="text-center text-[var(--color-muted)]">{p.loading}</p>;
  }

  if (!info?.paymentId) {
    return <p className="text-center text-red-500">{p.notFound}</p>;
  }

  if (success || info.status === "completed") {
    return (
      <div className="text-center">
        <p className="text-5xl">✅</p>
        <h1 className="mt-4 text-2xl font-bold">{p.success}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{info.paymentId}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-[var(--color-brand)] px-8 py-3 text-sm font-medium text-white"
        >
          {p.backHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">{p.payTitle}</h1>
      <p className="mt-2 text-3xl font-bold text-amber-600">
        {formatPrice(info.amount)}
      </p>

      {qr && (
        <Image
          src={qr}
          alt="QR"
          width={240}
          height={240}
          className="mx-auto mt-6 rounded-xl border"
          unoptimized
        />
      )}

      <p className="mt-4 text-sm text-[var(--color-muted)]">{p.qrHint}</p>

      {info.payUrl && (
        <a
          href={info.payUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block w-full max-w-xs rounded-full bg-[#0070ba] py-3 text-sm font-bold text-white"
        >
          {p.paypalBtn}
        </a>
      )}

      <button
        onClick={demoPay}
        className="mt-3 w-full max-w-xs rounded-full border border-amber-500 py-3 text-sm text-amber-600"
      >
        {p.demoPay}
      </button>
    </div>
  );
}

export default function PayPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Suspense fallback={<p className="text-center">Loading...</p>}>
        <PayContent />
      </Suspense>
    </div>
  );
}
