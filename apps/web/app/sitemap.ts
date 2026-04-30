import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"
import { productFilters } from "@/lib/catalog"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/order`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/track`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/review`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Category filter pages (e.g., /?filter=ai, /?filter=boosting)
  const categoryRoutes: MetadataRoute.Sitemap = productFilters
    .filter((filter) => filter.value !== "all")
    .map((filter) => ({
      url: `${siteConfig.url}/?filter=${filter.value}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

  // Dynamic product detail pages
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const { listActiveProducts } = await import("@wongdigital/db/storefront")
    const products = await listActiveProducts()
    productRoutes = products.map((product) => ({
      url: `${siteConfig.url}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    // Fallback: if DB is not available at build time, skip product routes
  }

  const legalRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}/legal`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/legal/terms-of-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/legal/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/legal/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/legal/disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...legalRoutes]
}
