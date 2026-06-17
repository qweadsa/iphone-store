import Image from "next/image";
import ProductImage from "./ProductImage";

type Props = {
  productId: string;
  name: string;
  color: string;
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
};

export default function ProductMedia({
  productId,
  name,
  color,
  imageUrl,
  className = "",
  priority = false,
}: Props) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={400}
        height={400}
        priority={priority}
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <ProductImage
      productId={productId}
      color={color}
      name={name}
      className={className}
    />
  );
}
