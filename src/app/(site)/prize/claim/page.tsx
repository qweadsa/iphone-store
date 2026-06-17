"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useUser } from "@/lib/user-context";

type ClaimInfo = {
  prizeName: string;
  needsShipping: boolean;
  claimed: boolean;
};

function PrizeClaimForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId")?.trim() ?? "";
  const { messages: m } = useI18n();
  const c = m.prizeClaim;
  const { user } = useUser();

  const [info, setInfo] = useState<ClaimInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    fetch(`/api/blindbox/claim?paymentId=${encodeURIComponent(paymentId)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Failed");
        setInfo(data);
        if (data.claimed) setDone(true);
        if (!data.needsShipping) {
          router.replace("/");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : c.loadFailed))
      .finally(() => setLoading(false));
  }, [paymentId, router, c.loadFailed]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/blindbox/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, name, email, phone, address, city, state, zip }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? c.submitFailed);
      return;
    }
    setDone(true);
  }

  if (!paymentId) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-[var(--color-muted)]">{c.missingPayment}</p>
        <Link href="/" className="site-btn mt-6 inline-block">
          {c.backHome}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center text-[var(--color-muted)]">
        {c.loading}
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-red-400">{error}</p>
        <Link href="/" className="site-btn mt-6 inline-block">
          {c.backHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">{c.title}</h1>
      <p className="mt-2 text-[var(--color-muted)]">{c.subtitle}</p>

      <div className="mt-6 site-card bg-gradient-to-br from-[#FFB800]/15 to-[#FF7A00]/10 p-5">
        <p className="text-sm text-[var(--color-muted)]">{c.prizeLabel}</p>
        <p className="mt-1 text-xl font-bold text-[#FFB800]">{info?.prizeName}</p>
      </div>

      {done ? (
        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-emerald-400">{c.successTitle}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{c.successDesc}</p>
          <Link href="/" className="site-btn mt-6 inline-block">
            {c.backHome}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={c.name}
            className="site-input"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.email}
            className="site-input"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={c.phone}
            className="site-input"
          />
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={c.address}
            rows={3}
            className="site-input"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={c.city}
              className="site-input"
            />
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder={c.state}
              className="site-input"
            />
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder={c.zip}
              className="site-input"
            />
          </div>
          <button type="submit" disabled={submitting} className="site-btn w-full disabled:opacity-50">
            {submitting ? c.submitting : c.submitBtn}
          </button>
        </form>
      )}
    </div>
  );
}

export default function PrizeClaimPage() {
  const { messages: m } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-16 text-center text-[var(--color-muted)]">
          {m.prizeClaim.loading}
        </div>
      }
    >
      <PrizeClaimForm />
    </Suspense>
  );
}
