import type { Product as DbProduct } from "@wongdigital/db/types"
import type { Product, WithContext } from "schema-dts"

import { siteConfig } from "@/lib/site"

type JsonLdType = "WebSite" | "Store" | "BreadcrumbList"

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite" as JsonLdType,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/?category={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateStoreJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store" as JsonLdType,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    foundingDate: "2024",
    currenciesAccepted: "PHP,USD,USDT",
    paymentAccepted: "QRPH, Binance Pay",
    areaServed: {
      "@type": "Place" as JsonLdType,
      name: "Worldwide",
    },
  }
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList" as JsonLdType,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateProductJsonLd(product: DbProduct): WithContext<Product> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || siteConfig.description,
    image: product.iconUrl ? [product.iconUrl] : [],
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  }
}
