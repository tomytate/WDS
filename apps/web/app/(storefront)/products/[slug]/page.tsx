import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"

import { getCachedProductBySlug, getCachedActiveProducts } from "@/lib/data-cache"

import OrderPage from "@/app/(storefront)/order/page"
import { RecentlyViewedTracker } from "@/components/storefront/recently-viewed-tracker"
import { siteConfig } from "@/lib/site"
import { generateProductJsonLd } from "@/lib/structured-data"

type ProductPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 86400 // Fallback revalidation time if on-demand fails

export async function generateStaticParams() {
  const activeProducts = await getCachedActiveProducts()
  return activeProducts.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: product.name,
    description: product.description || `Order ${product.name} seamlessly via ${siteConfig.name}.`,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} now on ${siteConfig.name}.`,
      images: product.iconUrl ? [{ url: product.iconUrl }] : undefined,
    },
  }
}

export default async function ProductLandingPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getCachedProductBySlug(slug)

  if (!product) {
    notFound()
  }

  // Reuse the OrderPage but simulate the product selection in searchParams
  const searchParams = Promise.resolve({ product: slug })

  return (
    <>
      <Script
        id={`product-jsonld`}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductJsonLd(product)),
        }}
        type="application/ld+json"
      />
      <RecentlyViewedTracker slug={slug} />
      <OrderPage searchParams={searchParams} />
    </>
  )
}
