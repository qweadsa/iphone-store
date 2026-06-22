"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { useI18n } from "@/lib/i18n-context";

function GoogleAuthDone() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useUser();
  const { messages: m } = useI18n();
  const a = m.auth;
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const nextPath = searchParams.get("next")?.trim() || "/";
      const claimPayment = searchParams.get("claimPayment")?.trim() || "";
      const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

      try {
        await refresh();

        if (claimPayment) {
          await fetch("/api/blindbox/claim-credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: claimPayment }),
          });
        }
      } catch {
        if (!cancelled) setError(a.googleAuthFailed);
        return;
      }

      if (!cancelled) {
        router.replace(safeNext);
        router.refresh();
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [refresh, router, searchParams, a.googleAuthFailed]);

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          <p className="text-lg font-medium">{a.loading}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{a.googleSigningIn}</p>
        </>
      )}
    </div>
  );
}

export default function GoogleAuthDonePage() {
  const { messages: m } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-16 text-center text-[var(--color-muted)]">
          {m.auth.loading}
        </div>
      }
    >
      <GoogleAuthDone />
    </Suspense>
  );
}
