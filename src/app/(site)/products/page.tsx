export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ProductsContent from "./ProductsContent";
import { getProducts } from "@/lib/cms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop iPhone — Direct Purchase | iPhone Store",
  description:
    "Buy genuine iPhones directly. Mystery Box is our main event — shop phones here when you want a sure purchase.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const products = await getProducts();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-6 py-12 text-[var(--color-muted)]">
          Loading...
        </div>
      }
    >
      <ProductsContent initialProducts={products} query={q} />
    </Suspense>
  );
}
