import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getSanityClient } from "./client";

export function urlFor(source: SanityImageSource) {
  const sanityClient = getSanityClient();
  if (!sanityClient) {
    throw new Error("Sanity client is not configured");
  }
  return imageUrlBuilder(sanityClient).image(source);
}

export function getImageUrl(
  source: SanityImageSource | null | undefined,
  width = 800,
): string | null {
  if (!source || !getSanityClient()) return null;
  return urlFor(source).width(width).auto("format").url();
}
