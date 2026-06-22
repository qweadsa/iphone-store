"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { useI18n } from "@/lib/i18n-context";
import GoogleSignInButton, { isGoogleSignInEnabled } from "@/components/GoogleSignInButton";

function oauthErrorMessage(code: string | null, a: ReturnType<typeof useI18n>["messages"]["auth"]): string {
  if (code === "google_denied") return a.googleDenied;
  if (code === "google_conflict") return a.googleConflict;
  if (code === "google_not_configured") return a.googleNotConfigured;
  if (code === "google_failed" || code === "google_invalid") return a.googleAuthFailed;
  return "";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useUser();
  const { messages: m } = useI18n();
  const a = m.auth;

  const nextPath = searchParams.get("next")?.trim() || "/";
  const claimPayment = searchParams.get("claimPayment")?.trim() || "";
  const googleEnabled = isGoogleSignInEnabled();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const oauthErr = oauthErrorMessage(searchParams.get("error"), a);
    if (oauthErr) setError(oauthErr);
  }, [searchParams, a]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error === "GOOGLE_ONLY" ? a.googleOnlyAccount : (data.error ?? a.loginFailed));
      return;
    }

    await refresh();

    if (claimPayment) {
      try {
        await fetch("/api/blindbox/claim-credit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: claimPayment }),
        });
      } catch {
        /* wallet claim can retry on account page */
      }
    }

    setLoading(false);
    router.push(nextPath.startsWith("/") ? nextPath : "/");
    router.refresh();
  }

  const registerHref = claimPayment
    ? `/register?next=${encodeURIComponent(nextPath)}&claimPayment=${encodeURIComponent(claimPayment)}`
    : `/register?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">{a.loginTitle}</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {claimPayment ? a.prizeCreditLogin : a.loginSubtitle}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {googleEnabled && (
          <>
            <GoogleSignInButton next={nextPath} claimPayment={claimPayment} label={a.googleSignIn} />
            <p className="text-center text-xs text-[var(--color-muted)]">{a.orContinue}</p>
          </>
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={a.email}
          className="site-input"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={a.password}
          className="site-input"
        />
        <button type="submit" disabled={loading} className="site-btn w-full disabled:opacity-50">
          {loading ? a.loading : claimPayment ? a.loginToClaimCredit : a.loginBtn}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        {a.noAccount}{" "}
        <Link href={registerHref} className="site-link">
          {a.registerBtn}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { messages: m } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-16 text-center text-[var(--color-muted)]">
          {m.auth.loading}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
