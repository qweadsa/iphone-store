"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice, getProductColorHex } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";
import ProductMedia from "./ProductMedia";

type ProductWithImage = Product & { imageUrl?: string | null };

export default function ProductCard({ product }: { product: ProductWithImage }) {
  const { messages: m } = useI18n();
  const p = m.products;
  const data = m.productData[product.id as keyof typeof m.productData];
  const name = product.name || data?.name || product.id;
  const tagline = product.tagline || data?.tagline || "";
  const startPrice = product.storageOptions[0]?.price ?? 0;

  const badgeLabel = product.badge
    ? p.badges[product.badge as keyof typeof p.badges]
    : null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-surface)] transition hover:border-[#FFB800]/30 hover:shadow-[0_8px_32px_rgba(255,184,0,0.12)]"
    >
      <div className="relative flex aspect-square items-center justify-center p-6">
        {badgeLabel && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#FFB800] px-3 py-1 text-xs font-bold text-[#03030A]">
            {badgeLabel}
          </span>
        )}
        <ProductMedia
          productId={product.id}
          name={name}
          color={getProductColorHex(product)}
          imageUrl={product.imageUrl}
          className="h-full w-full max-w-[220px] transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 pt-0">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{tagline}</p>
        <p className="mt-4 text-lg font-medium">
          {p.from} {formatPrice(startPrice)}
        </p>
        <span className="mt-4 text-sm font-medium text-[#FFB800] group-hover:underline">
          {p.viewDetails}
        </span>
      </div>
    </Link>
  );
}
