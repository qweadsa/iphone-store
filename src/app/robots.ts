import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iphone-store.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/cart"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
