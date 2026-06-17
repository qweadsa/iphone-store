import ProductEditClient from "./ProductEditClient";

type Props = { params: Promise<{ id: string }> };

export default async function ProductEditPage({ params }: Props) {
  const { id } = await params;
  return <ProductEditClient id={id} />;
}
