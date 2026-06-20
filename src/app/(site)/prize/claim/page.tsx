"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PrizeAddressForm from "@/components/PrizeAddressForm";
import SupportedEmailHint from "@/components/SupportedEmailHint";
import { getEmailValidationMessage, validateEmail } from "@/lib/email-validation";
import { useI18n } from "@/lib/i18n-context";
import { useUser } from "@/lib/user-context";
import {
  getPendingAddressClaims,
  type PendingAddressClaim,
} from "@/lib/guest-order-lookup";

type ClaimInfo = {
  prizeName: string;
  needsShipping: boolean;
  claimed: boolean;
};

type LookupResponse = {
  email: string;
  records: Parameters<typeof getPendingAddressClaims>[0];
};

function PrizeClaimForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId")?.trim() ?? "";
  const emailParam = searchParams.get("email")?.trim() ?? "";
  const { messages: m, locale } = useI18n();
  const c = m.prizeClaim;
  const o = m.orders;
  const { user } = useUser();

  const [info, setInfo] = useState<ClaimInfo | null>(null);
  const [loading, setLoading] = useState(!!paymentId);
  const [error, setError] = useState("");

  const [lookupEmail, setLookupEmail] = useState(emailParam || user?.email || "");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [pendingRecords, setPendingRecords] = useState<PendingAddressClaim[]>([]);
  const [lookupDone, setLookupDone] = useState(false);

  useEffect(() => {
    if (!paymentId) return;
    fetch(`/api/blindbox/claim?paymentId=${encodeURIComponent(paymentId)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Failed");
        setInfo(data);
        if (!data.needsShipping) {
          router.replace("/");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : c.loadFailed))
      .finally(() => setLoading(false));
  }, [paymentId, router, c.loadFailed]);

  useEffect(() => {
    if (paymentId || !emailParam) return;
    void runEmailLookup(emailParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam, paymentId]);

  async function runEmailLookup(em: string) {
    const check = validateEmail(em);
    if (!check.valid) {
      setLookupError(
        check.reason === "empty" ? o.fillEmail : getEmailValidationMessage(check.reason, locale),
      );
      return;
    }
    setLookupLoading(true);
    setLookupError("");
    setPendingRecords([]);
    setLookupDone(false);
    const params = new URLSearchParams({ email: check.normalized });
    const res = await fetch(`/api/orders?${params}`);
    const data = (await res.json()) as LookupResponse & { error?: string };
    setLookupLoading(false);
    if (!res.ok) {
      setLookupError(data.error ?? o.notFound);
      return;
    }
    const pending = getPendingAddressClaims(data.records ?? []);
    setPendingRecords(pending);
    setLookupDone(true);
    if (pending.length === 0) {
      setLookupError(c.noPendingAddress);
    }
  }

  if (paymentId) {
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
          <Link href="/prize/claim" className="site-btn mt-6 inline-block">
            {c.lookupByEmail}
          </Link>
        </div>
      );
    }

    if (info?.claimed) {
      return (
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <p className="text-lg font-semibold text-emerald-400">{c.successTitle}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{c.successDesc}</p>
          <Link href="/orders" className="site-btn mt-6 inline-block">
            {o.title}
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
        <div className="mt-8">
          <PrizeAddressForm
            paymentId={paymentId}
            prizeName={info?.prizeName ?? ""}
            defaultEmail={user?.email ?? ""}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-3xl font-bold">{c.title}</h1>
      <p className="mt-2 text-[var(--color-muted)]">{c.lookupSubtitle}</p>

      <div className="mt-8 space-y-3">
        <input
          type="email"
          value={lookupEmail}
          onChange={(e) => setLookupEmail(e.target.value)}
          placeholder={c.email}
          className="site-input"
        />
        <SupportedEmailHint compact />
        <button
          onClick={() => void runEmailLookup(lookupEmail)}
          disabled={lookupLoading}
          className="site-btn w-full disabled:opacity-50"
        >
          {lookupLoading ? c.searching : c.searchBtn}
        </button>
      </div>

      {lookupError && (
        <p className="mt-4 text-sm text-red-400">{lookupError}</p>
      )}

      {lookupDone && pendingRecords.length > 0 && (
        <div className="mt-8 space-y-4">
          {pendingRecords.map((record) => (
            <div key={record.paymentId} className="site-card p-5">
              <p className="text-sm text-[var(--color-muted)]">{c.prizeLabel}</p>
              <p className="mt-1 text-lg font-bold text-[#FFB800]">{record.prizeName}</p>
              <div className="mt-4">
                <PrizeAddressForm
                  paymentId={record.paymentId}
                  prizeName={record.prizeName}
                  defaultEmail={lookupEmail}
                  onSuccess={() => void runEmailLookup(lookupEmail)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
        <Link href="/orders" className="text-[#FFB800] hover:underline">
          {c.goOrders}
        </Link>
      </p>
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
