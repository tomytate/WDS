import type { Metadata } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"
import { ChevronRight, Clock, ShieldCheck, Zap } from "lucide-react"

import { getCachedProductBySlug, getCachedStoreSettings, getCachedActiveProducts, getCachedActiveBundles } from "@/lib/data-cache"
import { getProductSelectionMode, getServiceStartingPrice } from "@wongdigital/db/pricing"
import { Badge, Card, CardContent, SectionHeading } from "@wongdigital/ui"

import Link from "next/link"

import { ProductLogo } from "@/components/product-logo"
import { ProductDetailBlock } from "@/components/storefront/product-detail-block"
import { Footer } from "@/components/storefront/footer"
import { Navbar } from "@/components/storefront/navbar"
import { OrderForm } from "@/components/storefront/order-form"
import { isVisibleCatalogProduct } from "@/lib/catalog"
import { formatPrice } from "@/lib/format"
import { getProductSummary } from "@/lib/product-copy"
import { getStoreRuntimeFlags } from "@/lib/vercel/edge-config"
import { RecentlyViewedTracker } from "@/components/storefront/recently-viewed-tracker"
import { getAuthenticatedCustomer } from "@/lib/customer-auth"

export const metadata: Metadata = {
  title: "Order Now",
  description: "Build your order from our catalog of premium digital products and social boosting services. Mix subscriptions and services in one checkout.",
  alternates: {
    canonical: "/order",
  },
}

type OrderPageProps = {
  searchParams: Promise<{
    product?: string
  }>
}

export default function OrderPage({ searchParams }: OrderPageProps) {
  return (
    <main>
      <Navbar cartHref="#order-cart-summary" />
      <Suspense fallback={<OrderPageFallback />}>
        <OrderPageContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </main>
  )
}

async function OrderPageContent({ searchParams }: OrderPageProps) {
  const resolvedSearchParams = await searchParams
  const [allProducts, storeSettings, storeFlags, activeBundles] = await Promise.all([
    getCachedActiveProducts(),
    getCachedStoreSettings(),
    getStoreRuntimeFlags(),
    getCachedActiveBundles(),
  ])
  const headerStore = await headers()
  const countryCode = headerStore.get("x-vercel-ip-country") ?? "PH"

  // Gracefully check auth — null for guests, never blocks
  const authResult = await getAuthenticatedCustomer()
  const authenticatedCustomer = authResult
    ? {
        name: authResult.customer.name,
        email: authResult.customer.email,
        phone: authResult.customer.phone,
        walletBalance: authResult.customer.walletBalance,
      }
    : null

  const products = allProducts.filter(isVisibleCatalogProduct)
  const requestedProduct = resolvedSearchParams.product
    ? await getCachedProductBySlug(resolvedSearchParams.product)
    : null
  const preselectedProduct =
    requestedProduct &&
    isVisibleCatalogProduct(requestedProduct) &&
    (storeFlags.boostingEnabled ||
      getProductSelectionMode(requestedProduct) !== "service")
      ? requestedProduct
      : null

  return (
    <section className="relative min-h-[80vh]">
      <div className="editorial-grid pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_30%,transparent_90%)]" aria-hidden="true" />

      <div className="container-shell py-6 sm:py-10 lg:py-14">
      {preselectedProduct ? <RecentlyViewedTracker slug={preselectedProduct.slug} /> : null}
      <div className="space-y-5 sm:space-y-8">
        {/* Page header */}
        {/* Page header text explicitly stripped to optimize mobile viewport UX */ }

        {storeFlags.maintenanceMode || !storeFlags.acceptOrders || !storeFlags.boostingEnabled ? (
          <Card className="border-[--accent] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]">
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {storeFlags.maintenanceMode ? <Badge tone="accent">Maintenance Mode</Badge> : null}
                {!storeFlags.acceptOrders ? <Badge tone="muted">Orders Paused</Badge> : null}
                {!storeFlags.boostingEnabled ? <Badge tone="muted">Boosting Hidden</Badge> : null}
              </div>
              <p className="text-sm leading-7 text-[--text-primary]">
                {storeFlags.maintenanceMessage ??
                  (storeFlags.maintenanceMode
                    ? "Checkout is temporarily paused while we make store updates."
                    : !storeFlags.acceptOrders
                      ? "New checkout submissions are temporarily paused."
                      : "Boosting services are temporarily hidden. Digital products are still available.")}
              </p>
            </CardContent>
          </Card>
        ) : null}



        {/* Content */}
        <div className={preselectedProduct ? "grid gap-5 sm:gap-8 lg:grid-cols-[0.95fr_1.05fr]" : "grid gap-5 sm:gap-8"}>
          {preselectedProduct ? (
            <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-20 lg:h-fit">
              <Card className="relative overflow-hidden">
                <CardContent className="relative space-y-4 p-5 sm:space-y-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent" className="gap-1.5 text-[10px]">
                      <Zap size={10} aria-hidden="true" />
                      Pre-selected
                    </Badge>
                    <Badge tone="muted" className="gap-1.5 text-[10px]">
                      <Clock size={10} aria-hidden="true" />
                      24h delivery
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--accent)_16%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] p-2.5">
                      <ProductLogo
                        iconUrl={preselectedProduct.iconUrl}
                        name={preselectedProduct.name}
                        size="md"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl sm:text-2xl tracking-tight text-[--text-primary]">
                        {preselectedProduct.name}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[--text-secondary] line-clamp-2 sm:line-clamp-none">
                        {getProductSummary(preselectedProduct)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_70%,transparent)] p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[--text-muted] font-semibold">
                        {getProductSelectionMode(preselectedProduct) === "service"
                          ? "Starting at"
                          : "Base price"}
                      </p>
                      <p className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[--text-primary]">
                        {formatPrice(
                          getProductSelectionMode(preselectedProduct) === "service"
                            ? getServiceStartingPrice(preselectedProduct)
                            : preselectedProduct.price,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-2.5 py-1.5">
                      <ShieldCheck size={14} className="text-[--color-success]" aria-hidden="true" />
                      <span className="text-[11px] font-medium text-[--color-success]">
                        {getProductSelectionMode(preselectedProduct) === "service"
                          ? "Service"
                          : "1Y / Lifetime"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hide product details on mobile to save space */}
              <div className="hidden sm:block">
                <ProductDetailBlock product={preselectedProduct} />
              </div>
            </div>
          ) : null}

          <OrderForm
            products={products}
            bundles={activeBundles}
            selectedProductId={preselectedProduct?.id}
            storeSettings={storeSettings}
            storeFlags={storeFlags}
            countryCode={countryCode}
            authenticatedCustomer={authenticatedCustomer}
          />
        </div>
      </div>
      </div>
    </section>
  )
}

function OrderPageFallback() {
  return (
    <section className="container-shell py-10 sm:py-14">
      <div className="space-y-8">
        {/* Heading skeleton */}
        <div className="max-w-3xl space-y-3">
          <div className="h-3 w-24 rounded-full bg-[--bg-card]" />
          <div className="h-12 w-3/4 rounded-[--radius-card] bg-[--bg-card]" />
          <div className="h-6 w-2/3 rounded-xl bg-[--bg-card]" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="shimmer-bg h-56 rounded-[--radius-card] border border-[--border] bg-[--bg-card]" />
            <div className="h-40 rounded-[--radius-card] border border-[--border] bg-[--bg-card]" />
          </div>
          <div className="shimmer-bg h-[620px] rounded-[--radius-card] border border-[--border] bg-[--bg-card]" />
        </div>
      </div>
    </section>
  )
}
