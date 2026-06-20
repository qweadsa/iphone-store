"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { useUser } from "@/lib/user-context";
import SupportedEmailHint from "@/components/SupportedEmailHint";
import { getEmailValidationMessage, validateEmail } from "@/lib/email-validation";

type Props = {
  paymentId: string;
  prizeName: string;
  defaultEmail?: string;
  onSuccess?: () => void;
};

export default function PrizeAddressForm({
  paymentId,
  prizeName,
  defaultEmail = "",
  onSuccess,
}: Props) {
  const { messages: m, locale } = useI18n();
  const c = m.prizeClaim;
  const { user } = useUser();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(defaultEmail || user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email && !defaultEmail) setEmail(user.email);
  }, [user, defaultEmail]);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(getEmailValidationMessage(emailCheck.reason, locale));
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/blindbox/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId,
        name,
        email: emailCheck.normalized,
        phone,
        address,
        city,
        state,
        zip,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? c.submitFailed);
      return;
    }
    setDone(true);
    onSuccess?.();
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
        <p className="font-semibold text-emerald-400">{c.successTitle}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{c.successDesc}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm font-medium text-[#FFB800]">{prizeName}</p>
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
      <SupportedEmailHint compact />
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
      <div className="grid gap-3 sm:grid-cols-3">
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
  );
}
