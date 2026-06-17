"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n-context";
import type { Product } from "@/types/product";

type ProductWithImage = Product & { imageUrl?: string | null };

type Props = {
  initialProducts: ProductWithImage[];
  query?: string;
};

export default function ProductsContent({ initialProducts, query = "" }: Props) {
  const { messages: m, t } = useI18n();
  const p = m.products;

  const q = query.trim().toLowerCase();

  const filtered = initialProducts.filter((prod) =>
    q
      ? prod.name.toLowerCase().includes(q) ||
        prod.tagline.toLowerCase().includes(q) ||
        prod.id.toLowerCase().includes(q)
      : true,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{p.title}</h1>
          <p className="mt-2 max-w-xl text-[var(--color-muted)]">{p.subtitle}</p>
        </div>
        <Link
          href="/#draw"
          className="shrink-0 rounded-full border border-[#FFB800]/40 bg-[#FFB800]/10 px-5 py-2.5 text-sm font-semibold text-[#FFB800] transition hover:bg-[#FFB800]/20"
        >
          🎁 {m.nav.blindBox}
        </Link>
      </div>

      {q && (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          Search: &quot;{query}&quot;
        </p>
      )}
      <p className="mt-2 text-[var(--color-muted)]">{t(p.count, { count: filtered.length })}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-[var(--color-muted)]">{p.empty}</p>
      )}
    </div>
  );
}
