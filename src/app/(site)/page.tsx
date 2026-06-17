export const dynamic = "force-dynamic";

import BlindBoxLanding from "@/components/BlindBoxLanding";
import JsonLd from "@/components/JsonLd";
import {
  getProducts,
  getBlindBoxConfig,
  getBlindBoxPrizes,
  getSiteSettings,
} from "@/lib/cms";
import { getBlindBoxStats, getPublicWinnerRows } from "@/lib/blindbox-stats";
import {
  DEFAULT_BLIND_BOX_PRICE,
  DEFAULT_GRAND_PRIZE_VALUE,
  formatAdminPrice,
  MARKET_CURRENCY,
  market,
} from "@/lib/market";
import { formatMarketPrice } from "@/lib/locale-resolve";
import { resolveHeroShowcaseFrames } from "@/lib/hero-showcase";
import { getHeroMobileWebpUrl, isLocalRasterPng } from "@/lib/hero-image-url";
import { unstable_noStore as noStore } from "next/cache";
import { preload } from "react-dom";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iphone-store.com";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, config] = await Promise.all([
    getSiteSettings(),
    getBlindBoxConfig(),
  ]);
  return {
    title:
      settings?.homeSeoTitle ??
      config.seoTitle ??
      `Win iPhone 17 Pro Max — ${formatAdminPrice(DEFAULT_BLIND_BOX_PRICE)} Mystery Box`,
    description:
      settings?.homeSeoDescription ??
      config.seoDescription ??
      `Just ${formatAdminPrice(DEFAULT_BLIND_BOX_PRICE)} for one chance to win iPhone 17 Pro Max worth ${DEFAULT_GRAND_PRIZE_VALUE}. Limited event, free shipping in ${market.country}.`,
    keywords: [
      "iPhone mystery box",
      "win iPhone 17 Pro Max",
      "blind box Malaysia",
      `${formatAdminPrice(DEFAULT_BLIND_BOX_PRICE)} iPhone giveaway`,
      "mystery box iPhone",
    ],
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      type: "website",
      url: siteUrl,
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function Page() {
  noStore();
  const renderedAt = Date.now();
  const [products, blindBoxConfig, prizes, stats] = await Promise.all([
    getProducts(),
    getBlindBoxConfig(),
    getBlindBoxPrizes(),
    getBlindBoxStats(),
  ]);
  const publicWinners =
    blindBoxConfig.winnersDemoMode === false ? await getPublicWinnerRows() : [];

  const heroFrames = resolveHeroShowcaseFrames(blindBoxConfig.heroShowcase);
  const firstHeroSrc = heroFrames[0]?.src;
  if (firstHeroSrc && isLocalRasterPng(firstHeroSrc)) {
    preload(getHeroMobileWebpUrl(firstHeroSrc), { as: "image", fetchPriority: "high" });
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "iPhone Store Mystery Box",
      url: siteUrl,
      description: blindBoxConfig.seoDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/products?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `iPhone Mystery Box — Win ${blindBoxConfig.grandPrizeName}`,
      description: blindBoxConfig.seoDescription,
      image: blindBoxConfig.grandPrizeImageUrl ?? `${siteUrl}/og-mystery-box.png`,
      brand: { "@type": "Brand", name: "iPhone Store" },
      offers: {
        "@type": "Offer",
        price: blindBoxConfig.price,
        priceCurrency: MARKET_CURRENCY,
        availability: blindBoxConfig.enabled
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: siteUrl,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: MARKET_CURRENCY,
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: market.market,
          },
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How much does the iPhone Mystery Box cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Each draw costs ${formatMarketPrice(blindBoxConfig.price, "en")}. Pay once, open your box, and win instantly.`,
          },
        },
        {
          "@type": "Question",
          name: "What is the grand prize?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `The grand prize is ${blindBoxConfig.grandPrizeName} (${blindBoxConfig.grandPrizeValue}).`,
          },
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlindBoxLanding
        config={blindBoxConfig}
        prizes={prizes}
        products={products}
        stats={stats}
        publicWinners={publicWinners}
        renderedAt={renderedAt}
      />
    </>
  );
}
