import type { Metadata } from "next"
import Script from "next/script"

import {
  getCachedActiveProducts,
  getCachedRecentOrders,
} from "@/lib/data-cache"

import { CommandPalette } from "@/components/storefront/command-palette"
import { FAQAccordion } from "@/components/storefront/faq-accordion"
import { Footer } from "@/components/storefront/footer"
import { HeroSection } from "@/components/storefront/hero-section"
import { HowItWorks } from "@/components/storefront/how-it-works"
import { Navbar } from "@/components/storefront/navbar"
import { ProductGrid } from "@/components/storefront/product-grid"
import { SocialProof } from "@/components/storefront/social-proof"
import { WhyUs } from "@/components/storefront/why-us"
import { RecentlyViewedRow } from "@/components/storefront/recently-viewed-row"
import { SocialProofToast } from "@/components/marketing/social-proof-toast"
import { PromoBannerBar } from "@/components/marketing/promo-banner-bar"
import { ResumeOrderToast } from "@/components/storefront/resume-order-toast"
import { getCatalogProducts, normalizeFilter } from "@/lib/catalog"
import { siteConfig } from "@/lib/site"
import { generateStoreJsonLd, generateWebsiteJsonLd } from "@/lib/structured-data"
import { getStoreRuntimeFlags } from "@/lib/vercel/edge-config"

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
}

type HomePageProps = {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams
  const activeFilter = normalizeFilter(resolvedSearchParams.category)
  const allProducts = await getCachedActiveProducts()
  const products = getCatalogProducts(allProducts, activeFilter)
  const recentOrders = await getCachedRecentOrders(20)
  const storeFlags = await getStoreRuntimeFlags()

  return (
    <main id="main-content">
      <Script
        id="website-jsonld"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebsiteJsonLd()),
        }}
        type="application/ld+json"
      />
      <Script
        id="store-jsonld"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStoreJsonLd()),
        }}
        type="application/ld+json"
      />
      <PromoBannerBar banner={storeFlags.promoBanner} />
      <Navbar />
      <HeroSection />
      <RecentlyViewedRow products={allProducts} />
      <ProductGrid activeFilter={activeFilter} products={products} />
      <SocialProof />
      <HowItWorks />
      <WhyUs />
      <FAQAccordion />
      <Footer />
      <CommandPalette products={allProducts} />
      <SocialProofToast initialOrders={recentOrders} />
      <ResumeOrderToast />
    </main>
  )
}
