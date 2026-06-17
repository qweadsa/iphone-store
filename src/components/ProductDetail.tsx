"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { formatPrice, getProductColorHex } from "@/lib/products";
import { useI18n } from "@/lib/i18n-context";
import AddToCartButton from "./AddToCartButton";
import ProductMedia from "./ProductMedia";

type ProductWithImage = Product & {
  imageUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
};

export default function ProductDetail({
  product,
}: {
  product: ProductWithImage;
}) {
  const { messages: m, t } = useI18n();
  const p = m.products;
  const data = m.productData[product.id as keyof typeof m.productData];
  const name = product.name || data?.name || product.id;
  const tagline = product.tagline || data?.tagline || "";
  const description = product.description || data?.description || "";
  const features = product.features.length > 0 ? product.features : (data?.features ?? []);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [selectedStorage, setSelectedStorage] = useState(
    product.storageOptions[0].size,
  );

  const currentPrice =
    product.storageOptions.find((s) => s.size === selectedStorage)?.price ??
    product.storageOptions[0].price;

  const selectedColorHex = getProductColorHex(product, selectedColor);

  const colorLabel = selectedColor;

  const badgeLabel = product.badge
    ? p.badges[product.badge as keyof typeof p.badges]
    : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div
          className="flex items-center justify-center rounded-3xl p-8 transition-colors duration-300"
          style={{ backgroundColor: `${selectedColorHex}22` }}
        >
          <ProductMedia
            productId={product.id}
            color={selectedColorHex}
            name={name}
            imageUrl={product.imageUrl}
            className="h-auto w-full max-w-[320px]"
            priority
          />
        </div>

        <div>
          {badgeLabel && (
            <span className="rounded-full bg-[#FFB800] px-3 py-1 text-xs font-bold text-[#03030A]">
              {badgeLabel}
            </span>
          )}
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {name}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-muted)]">
            {tagline}
          </p>
          <p className="mt-6 text-3xl font-semibold">
            {formatPrice(currentPrice)}
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium">
              {t(p.color, { color: colorLabel })}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    selectedColor === color.name
                      ? "border-[#FFB800] ring-2 ring-[#FFB800] ring-offset-2 ring-offset-[#03030A]"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium">{p.storage}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.storageOptions.map((option) => (
                <button
                  key={option.size}
                  onClick={() => setSelectedStorage(option.size)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                    selectedStorage === option.size
                      ? "bg-[#FFB800] text-[#03030A]"
                      : "border border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/10"
                  }`}
                >
                  {option.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <AddToCartButton
              product={product}
              displayName={name}
              colorLabel={colorLabel}
              selectedColor={selectedColor}
              selectedStorage={selectedStorage}
              price={currentPrice}
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-[var(--color-muted)]">
            {description}
          </p>

          <ul className="mt-6 space-y-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-[var(--color-muted)]"
              >
                <span className="text-[#FFB800]">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
