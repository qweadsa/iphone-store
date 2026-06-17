"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";
import PaymentModal from "./PaymentModal";

type Props = {
  total: number;
  onClose: () => void;
};

export default function CheckoutForm({ total, onClose }: Props) {
  const { items, clearCart } = useCart();
  const { messages: m } = useI18n();
  const c = m.cart;
  const p = m.payment;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [showPay, setShowPay] = useState(false);

  async function createOrder(paymentId: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        email,
        phone,
        address,
        city,
        state,
        zip,
        paymentId,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          color: item.color,
          storage: item.storage,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? c.checkoutError);
      return;
    }
    setOrderNumber(data.orderNumber);
    clearCart();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowPay(true);
  }

  if (orderNumber) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center">
          <p className="text-5xl">✅</p>
          <h2 className="mt-4 text-2xl font-bold">{c.orderSuccess}</h2>
          <p className="mt-2 text-[var(--color-muted)]">{c.orderSuccessDesc}</p>
          <p className="mt-4 rounded-lg bg-[var(--color-surface)] px-4 py-3 font-mono text-lg font-bold">
            {orderNumber}
          </p>
          <Link
            href={`/orders?orderNumber=${orderNumber}&email=${encodeURIComponent(email)}`}
            className="mt-6 block text-sm text-[var(--color-brand)] hover:underline"
          >
            {c.trackOrder}
          </Link>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-full bg-[var(--color-brand)] py-3 text-sm font-medium text-white"
          >
            {c.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <form
          onSubmit={submit}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{c.checkoutTitle}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--color-muted)] hover:text-black"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {c.checkoutTotal}: {formatPrice(total)}
          </p>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <div className="mt-4 space-y-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.name}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.email}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={c.phone}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={c.address}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={c.city}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder={c.state}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder={c.zip}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-[var(--color-brand)] py-4 text-sm font-medium text-white"
          >
            {c.checkout}
          </button>
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            {p.paypalHint}
          </p>
        </form>
      </div>

      {showPay && (
        <PaymentModal
          amount={total}
          purpose="cart"
          title={c.checkoutTitle}
          onClose={() => setShowPay(false)}
          onSuccess={async (paymentId) => {
            setShowPay(false);
            await createOrder(paymentId);
          }}
        />
      )}
    </>
  );
}
