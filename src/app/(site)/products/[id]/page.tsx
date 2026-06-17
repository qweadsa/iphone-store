export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { getProductBySlug } from "@/lib/cms";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle ?? `${product.name} — iPhone Store`,
    description: product.seoDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
