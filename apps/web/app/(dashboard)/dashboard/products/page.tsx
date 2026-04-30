import { ChevronRight } from "lucide-react"
import { listAllProducts } from "@wongdigital/db/storefront"
import { Button, Card, CardContent, Input, PageHeader, Select, Textarea } from "@wongdigital/ui"

import {
  saveProductAction,
  toggleProductActiveAction,
} from "@/app/(dashboard)/dashboard/actions"
import { ProductLogo } from "@/components/product-logo"
import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { formatPrice } from "@/lib/format"

type ProductsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function DashboardProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const products = await listAllProducts()
  const activeCount = products.filter((product) => product.isActive).length
  const inactiveCount = products.length - activeCount

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Products"
        description="Add subscriptions or services, set base pricing, and deactivate listings without losing order history."
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div aria-label="Catalog summary" className="mb-6 flex flex-wrap gap-3">
        <span className="inline-flex rounded-full border border-[--border] bg-[--bg-surface] px-4 py-2 text-sm text-[--text-secondary]">
          {products.length} total
        </span>
        <span className="inline-flex rounded-full border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] px-4 py-2 text-sm text-[--color-success]">
          {activeCount} active
        </span>
        <span className="inline-flex rounded-full border border-[--border] bg-[--bg-surface] px-4 py-2 text-sm text-[--text-secondary]">
          {inactiveCount} inactive
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                Add product
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">
                Create a new listing
              </h2>
            </div>

            <form
              action={saveProductAction}
              className="grid gap-4"
            >
              <input
                name="returnTo"
                type="hidden"
                value="/dashboard/products"
              />
              <Input
                name="name"
                placeholder="Product name"
                required
              />
              <Input
                name="slug"
                placeholder="Slug (optional, auto-generated from name)"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="price"
                  placeholder="349.00"
                  required
                />
                <Input
                  name="category"
                  placeholder="ai-assistant"
                  required
                />
              </div>
              <Input
                name="iconUrl"
                placeholder="/logos/chatgpt.png or https://example.com/icon.png"
              />
              <p className="-mt-2 text-xs leading-6 text-[--text-secondary]">
                Optional. Use a local path like /logos/chatgpt.png or an external image URL.
              </p>
              <p className="-mt-3 text-xs leading-6 text-[--text-secondary]">
                Subscriptions use this price as the 1-year base. Services use it as the per-unit rate for quantity checkout.
              </p>
              <Textarea
                name="description"
                placeholder="Short product description"
              />
              <Select
                defaultValue="true"
                name="isActive"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <Button type="submit">Save product</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                  Catalog
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">
                  Existing products
                </h2>
              </div>
              <p className="text-sm text-[--text-secondary]">
                {products.length} item{products.length === 1 ? "" : "s"}
              </p>
            </div>

            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <details
                    className="group rounded-2xl border border-[--border] bg-[--bg-surface] p-4"
                    key={product.id}
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-transform group-open:rotate-90">
                            <ChevronRight size={16} aria-hidden="true" />
                          </span>
                          <ProductLogo
                            iconUrl={product.iconUrl}
                            name={product.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-display text-2xl tracking-tight">{product.name}</p>
                            <p className="mt-1 text-sm text-[--text-secondary]">
                              {product.category} · {formatPrice(product.price)} · {product.slug}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                            product.isActive
                              ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success]"
                              : "border-[--border] bg-[--bg-card] text-[--text-secondary]"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </summary>

                    <div className="mt-4 grid gap-4">
                      <form
                        action={saveProductAction}
                        className="grid gap-4"
                      >
                        <input
                          name="id"
                          type="hidden"
                          value={product.id}
                        />
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/products"
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            defaultValue={product.name}
                            name="name"
                            required
                          />
                          <Input
                            defaultValue={product.slug}
                            name="slug"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            defaultValue={product.price}
                            name="price"
                            required
                          />
                          <Input
                            defaultValue={product.category}
                            name="category"
                            required
                          />
                        </div>
                        <Input
                          defaultValue={product.iconUrl ?? ""}
                          name="iconUrl"
                          placeholder="https://example.com/icon.png"
                        />
                        <Textarea
                          defaultValue={product.description ?? ""}
                          name="description"
                        />
                        <Select
                          defaultValue={product.isActive ? "true" : "false"}
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

                      <form action={toggleProductActiveAction}>
                        <input
                          name="productId"
                          type="hidden"
                          value={product.id}
                        />
                        <input
                          name="isActive"
                          type="hidden"
                          value={product.isActive ? "false" : "true"}
                        />
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/products"
                        />
                        <Button
                          type="submit"
                          variant="surface"
                        >
                          {product.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[--border] bg-[--bg-surface] p-6 text-sm text-[--text-secondary]">
                No products yet. Create your first listing using the form on the left.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
