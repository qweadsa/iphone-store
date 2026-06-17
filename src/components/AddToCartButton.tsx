"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n-context";
import type { Product } from "@/types/product";
import { getProductColorHex } from "@/lib/products";

type Props = {
  product: Product;
  displayName: string;
  colorLabel: string;
  selectedColor: string;
  selectedStorage: string;
  price: number;
};

export default function AddToCartButton({
  product,
  displayName,
  colorLabel,
  selectedColor,
  selectedStorage,
  price,
}: Props) {
  const { addItem } = useCart();
  const { messages: m } = useI18n();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: displayName,
      color: colorLabel,
      colorHex: getProductColorHex(product, selectedColor),
      storage: selectedStorage,
      price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className="site-btn w-full py-4 disabled:opacity-50"
    >
      {added ? m.products.added : m.products.addToCart}
    </button>
  );
}
