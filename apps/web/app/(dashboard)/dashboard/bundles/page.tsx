import { ChevronRight, Library, Package, PenTool } from "lucide-react"
import Image from "next/image"
import { listAllBundles, listAllProducts } from "@wongdigital/db/storefront"
import { Button, Card, CardContent, Input, PageHeader, Select, Textarea } from "@wongdigital/ui"

import {
  saveBundleAction,
  toggleBundleActiveAction,
} from "@/app/(dashboard)/dashboard/actions"
import { BundleItemsPicker } from "@/components/dashboard/bundle-items-picker"
import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { formatPrice } from "@/lib/format"

type BundlesPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function DashboardBundlesPage({
  searchParams,
}: BundlesPageProps) {
  const resolvedSearchParams = await searchParams
  const bundles = await listAllBundles()
  const products = await listAllProducts()
  const activeCount = bundles.filter((b) => b.isActive).length
  const inactiveCount = bundles.length - activeCount

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Bundles"
        description="Curate sets of tools at a combined discount."
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div aria-label="Bundle summary" className="mb-6 flex flex-wrap gap-3">
        <span className="inline-flex rounded-full border border-[--border] bg-[--bg-surface] px-4 py-2 text-sm text-[--text-secondary]">
          {bundles.length} total
        </span>
        <span className="inline-flex rounded-full border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] px-4 py-2 text-sm text-[--color-success]">
          {activeCount} active
        </span>
        <span className="inline-flex rounded-full border border-[--border] bg-[--bg-surface] px-4 py-2 text-sm text-[--text-secondary]">
          {inactiveCount} inactive
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                Add bundle
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">
                Create a new pack
              </h2>
            </div>

            <form
              action={saveBundleAction}
              className="grid gap-4"
            >
              <input
                name="returnTo"
                type="hidden"
                value="/dashboard/bundles"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="name"
                  placeholder="Master AI Toolkit"
                  required
                />
                <Input
                  name="slug"
                  placeholder="master-ai-toolkit"
                />
              </div>

              <Textarea
                name="description"
                placeholder="A collection of the best tools for..."
                rows={3}
              />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-[--text-secondary]">Bundle price (USDT)</label>
                  <Input
                    name="bundlePrice"
                    placeholder="999.00"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[--text-secondary]">Original combined value (USDT)</label>
                  <Input
                    name="originalPrice"
                    placeholder="1500.00"
                    required
                  />
                </div>
              </div>
              <Input
                name="iconUrl"
                placeholder="https://example.com/icon.png or left blank"
              />

              {/* Client Component Array Builder */}
              <BundleItemsPicker products={products} />

              <Select
                defaultValue="true"
                name="isActive"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <Button type="submit">Create bundle</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                  Collections
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">
                  Existing bundles
                </h2>
              </div>
            </div>

            {bundles.length > 0 ? (
              <div className="space-y-4">
                {bundles.map((bundle) => {
                  const savings = Math.max(0, Number(bundle.originalPrice) - Number(bundle.bundlePrice))
                  const percentOff = Math.round((savings / Number(bundle.originalPrice)) * 100)

                  return (
                  <details
                    className="group rounded-2xl border border-[--border] bg-[--bg-surface] p-4"
                    key={bundle.id}
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-transform group-open:rotate-90">
                            <ChevronRight size={16} aria-hidden="true" />
                          </span>
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[--accent-tint-soft] text-[--accent] ring-1 ring-[--accent-tint-strong]">
                            {bundle.iconUrl ? (
                              <Image src={bundle.iconUrl} alt={bundle.name} width={24} height={24} className="h-6 w-6 object-contain" />
                            ) : (
                              <Library size={20} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-xl tracking-tight leading-tight">
                              {bundle.name}
                            </p>
                            <p className="mt-0.5 text-sm text-[--color-success] font-medium flex items-center gap-1.5">
                              {formatPrice(bundle.bundlePrice)} <span className="text-[--text-muted] line-through font-normal mr-1">{formatPrice(bundle.originalPrice)}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider rounded-md bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] px-1.5 py-0.5">Save {percentOff}%</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                              bundle.isActive
                                ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success]"
                                : "border-[--border] bg-[--bg-card] text-[--text-secondary]"
                            }`}
                          >
                            {bundle.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-5 border-t border-dashed border-[--border] pt-5">
                      <form
                        action={saveBundleAction}
                        className="grid gap-4"
                      >
                        <input
                          name="id"
                          type="hidden"
                          value={bundle.id}
                        />
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/bundles"
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            name="name"
                            defaultValue={bundle.name}
                            required
                          />
                          <Input
                            name="slug"
                            defaultValue={bundle.slug}
                          />
                        </div>

                        <Textarea
                          name="description"
                          defaultValue={bundle.description ?? ""}
                          rows={2}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                           <div>
                             <label className="mb-1 block text-xs text-[--text-secondary]">Bundle price (USDT)</label>
                             <Input
                               name="bundlePrice"
                               defaultValue={bundle.bundlePrice}
                               required
                             />
                           </div>
                           <div>
                             <label className="mb-1 block text-xs text-[--text-secondary]">Original value (USDT)</label>
                             <Input
                               name="originalPrice"
                               defaultValue={bundle.originalPrice}
                               required
                             />
                           </div>
                        </div>
                        <Input
                          name="iconUrl"
                          defaultValue={bundle.iconUrl ?? ""}
                          placeholder="Icon URL"
                        />

                        {/* Existing Picked Items Array */}
                        <BundleItemsPicker 
                          products={products} 
                          initialItems={bundle.items.map((item) => ({ productId: item.product.id, accessPlan: item.accessPlan }))}
                        />

                        <Select
                          defaultValue={bundle.isActive ? "true" : "false"}
                          name="isActive"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </Select>
                        
                        <Button
                          type="submit"
                          variant="ghost"
                        >
                          Save changes
                        </Button>
                      </form>

                      <form action={toggleBundleActiveAction} className="mt-4">
                        <input
                          name="bundleId"
                          type="hidden"
                          value={bundle.id}
                        />
                        <input
                          name="isActive"
                          type="hidden"
                          value={bundle.isActive ? "false" : "true"}
                        />
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/bundles"
                        />
                        <Button
                          className="w-full"
                          type="submit"
                          variant="surface"
                        >
                          {bundle.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </details>
                )})}
              </div>
            ) : (
              <div className="rounded-2xl border border-[--border] bg-[--bg-surface] p-6 text-sm text-[--text-secondary]">
                No bundles yet. Create your first pack using the form on the left.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
