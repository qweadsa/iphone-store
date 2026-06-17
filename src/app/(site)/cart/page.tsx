"use client";

import Link from "next/link";
import { useState } from "react";
import { itemKey, useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";
import ProductImage from "@/components/ProductImage";
import CheckoutForm from "@/components/CheckoutForm";

export default function CartPage() {
  const { items, total, itemCount, removeItem, updateQuantity, clearCart } = useCart();
  const { messages: m, t } = useI18n();
  const c = m.cart;
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <p className="text-6xl">🛍️</p>
        <h1 className="mt-6 text-3xl font-bold">{c.empty}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{c.emptyDesc}</p>
        <Link href="/products" className="site-btn mt-8 inline-block">
          {c.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
        <button
          onClick={clearCart}
          className="text-sm text-[var(--color-muted)] hover:text-red-400"
        >
          {c.clear}
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{t(c.items, { count: itemCount })}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const key = itemKey(item);
            return (
              <div key={key} className="site-card flex gap-4 p-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-1">
                  {item.productId === "blindbox-draw" ? (
                    <span className="text-4xl">🎁</span>
                  ) : (
                    <ProductImage
                      productId={item.productId}
                      color={item.colorHex ?? "#BFA48F"}
                      name={item.name}
                      className="h-full w-full"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {item.color} · {item.storage}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium text-[#FFB800]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(key)}
                        className="text-sm text-[var(--color-muted)] hover:text-red-400"
                      >
                        {c.remove}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="site-card h-fit p-6">
          <h2 className="text-lg font-semibold">{c.summary}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">{c.subtotal}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">{c.shipping}</span>
              <span className="text-emerald-400">{c.free}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-lg font-semibold">
            <span>{c.total}</span>
            <span className="text-[#FFB800]">{formatPrice(total)}</span>
          </div>
          <button onClick={() => setCheckoutOpen(true)} className="site-btn mt-6 w-full py-4">
            {c.checkout}
          </button>
          <p className="mt-3 text-center text-xs text-[var(--color-muted)]">{c.checkoutNote}</p>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutForm total={total} onClose={() => setCheckoutOpen(false)} />
      )}
    </div>
  );
}
