"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useUser } from "@/lib/user-context";
import { useI18n } from "@/lib/i18n-context";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useUser();
  const { messages: m } = useI18n();
  const a = m.auth;

  const nextPath = searchParams.get("next")?.trim() || "/";
  const claimPayment = searchParams.get("claimPayment")?.trim() || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? a.registerFailed);
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
        /* ignore */
      }
    }

    setLoading(false);
    router.push(nextPath.startsWith("/") ? nextPath : "/");
    router.refresh();
  }

  const loginHref = claimPayment
    ? `/login?next=${encodeURIComponent(nextPath)}&claimPayment=${encodeURIComponent(claimPayment)}`
    : `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">{a.registerTitle}</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        {claimPayment ? a.prizeCreditLogin : a.registerSubtitle}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={a.name}
          className="site-input"
        />
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={a.password}
          className="site-input"
        />
        <button type="submit" disabled={loading} className="site-btn w-full disabled:opacity-50">
          {loading ? a.loading : a.registerBtn}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        {a.hasAccount}{" "}
        <Link href={loginHref} className="site-link">
          {a.loginBtn}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const { messages: m } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-16 text-center text-[var(--color-muted)]">
          {m.auth.loading}
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

