import { ChevronRight, Clock, Percent, ShieldAlert } from "lucide-react"
import { listAllPromoCodes } from "@wongdigital/db/storefront"
import { Button, Card, CardContent, Input, PageHeader, Select, Textarea } from "@wongdigital/ui"

import {
  savePromoAction,
  togglePromoActiveAction,
} from "@/app/(dashboard)/dashboard/actions"
import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { formatDate, formatPrice } from "@/lib/format"

type PromosPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function DashboardPromosPage({
  searchParams,
}: PromosPageProps) {
  const resolvedSearchParams = await searchParams
  const promos = await listAllPromoCodes()
  const activeCount = promos.filter((p) => p.isActive).length
  const inactiveCount = promos.length - activeCount

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Promos"
        description="Discount codes with usage limits, expiration dates, and active/inactive toggles."
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div aria-label="Promo summary" className="mb-6 flex flex-wrap gap-3">
        <span className="inline-flex rounded-full border border-[--border] bg-[--bg-surface] px-4 py-2 text-sm text-[--text-secondary]">
          {promos.length} total
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
                Add promo
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">
                Create a new code
              </h2>
            </div>

            <form
              action={savePromoAction}
              className="grid gap-4"
            >
              <input
                name="returnTo"
                type="hidden"
                value="/dashboard/promos"
              />
              <Input
                name="code"
                placeholder="e.g. SUMMER2026"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  defaultValue="percentage"
                  name="discountType"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (USDT)</option>
                </Select>
                <Input
                  name="discountValue"
                  placeholder="e.g. 20 or 500"
                  required
                />
              </div>

              <div className="mt-2 space-y-4 rounded-[--radius-card] border border-[--border] bg-[--bg-surface] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted] mb-1">
                  Constraints & limits
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-[--text-secondary]">Min order amount (USDT)</label>
                    <Input
                      name="minOrderAmount"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[--text-secondary]">Max discount (USDT)</label>
                    <Input
                      name="maxDiscountAmount"
                      placeholder="No limit"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[--text-secondary]">Start date</label>
                    <Input
                      name="startsAt"
                      type="datetime-local"
                      defaultValue={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[--text-secondary]">End date (optional)</label>
                    <Input
                      name="expiresAt"
                      type="datetime-local"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-[--text-secondary]">Max global uses</label>
                    <Input
                      name="maxUses"
                      placeholder="Leave blank for unlimited"
                    />
                  </div>
                </div>
              </div>

              <Select
                defaultValue="true"
                name="isActive"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <Button type="submit">Save promo</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                  Registry
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">
                  Existing codes
                </h2>
              </div>
              <p className="text-sm text-[--text-secondary]">
                {promos.length} item{promos.length === 1 ? "" : "s"}
              </p>
            </div>

            {promos.length > 0 ? (
              <div className="space-y-4">
                {promos.map((promo) => {
                  const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date()
                  const isExhausted = promo.maxUses !== null && promo.currentUses >= promo.maxUses

                  return (
                  <details
                    className="group rounded-[--radius-card] border border-[--border] bg-[--bg-surface] p-4"
                    key={promo.id}
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[--border] bg-[--bg-card] text-[--text-secondary] transition-transform group-open:rotate-90">
                            <ChevronRight size={16} aria-hidden="true" />
                          </span>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-surface] text-[--text-primary]">
                            <Percent size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-xl tracking-tight uppercase break-all">
                              {promo.code}
                            </p>
                            <p className="mt-0.5 text-sm text-[--text-secondary] truncate">
                              {promo.discountType === "percentage" ? `${promo.discountValue}% off` : `USDT ${promo.discountValue} off`} 
                              {Number(promo.minOrderAmount) > 0 && ` (Min USDT ${promo.minOrderAmount})`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          {isExpired && (
                            <span className="inline-flex rounded-full border border-[--color-warning] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[--color-warning]">
                              Expired
                            </span>
                          )}
                          {isExhausted && (
                            <span className="inline-flex rounded-full border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[--color-danger]">
                              Limit reached
                            </span>
                          )}
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                              promo.isActive && !isExpired && !isExhausted
                                ? "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[--color-success]"
                                : "border-[--border] bg-[--bg-card] text-[--text-secondary]"
                            }`}
                          >
                            {promo.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-4 grid gap-4">
                      
                      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-4 flex gap-4 text-sm text-[--text-primary]">
                         <div>
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Total uses</span>
                            <span className="font-medium">{promo.currentUses} {promo.maxUses ? `/ ${promo.maxUses}` : ""}</span>
                         </div>
                         <div>
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">Created</span>
                            <span className="font-medium">{formatDate(promo.createdAt)}</span>
                         </div>
                      </div>

                      <form
                        action={savePromoAction}
                        className="grid gap-4"
                      >
                        <input
                          name="id"
                          type="hidden"
                          value={promo.id}
                        />
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/promos"
                        />
                        <Input
                          defaultValue={promo.code}
                          name="code"
                          required
                          placeholder="Code (e.g. SUMMER26)"
                        />
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                           <Select
                             defaultValue={promo.discountType}
                             name="discountType"
                           >
                             <option value="percentage">Percentage (%)</option>
                             <option value="fixed">Fixed amount (USDT)</option>
                           </Select>
                           <Input
                             defaultValue={promo.discountValue}
                             name="discountValue"
                             required
                           />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 rounded-[--radius-card] border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-3">
                           <div>
                             <label className="mb-1 block text-xs text-[--text-secondary]">Min order amount (USDT)</label>
                             <Input
                               name="minOrderAmount"
                               defaultValue={promo.minOrderAmount ?? ""}
                               placeholder="0.00"
                             />
                           </div>
                           <div>
                             <label className="mb-1 block text-xs text-[--text-secondary]">Max discount (USDT)</label>
                             <Input
                               name="maxDiscountAmount"
                               defaultValue={promo.maxDiscountAmount ?? ""}
                               placeholder="No limit"
                             />
                           </div>
                           <div>
                             <label className="mb-1 block text-xs text-[--text-secondary]">Start date</label>
                             <Input
                               name="startsAt"
                               type="datetime-local"
                               defaultValue={new Date(promo.startsAt).toISOString().slice(0, 16)}
                               required
                             />
                           </div>
                           <div>
                             <label className="mb-1 block text-xs text-[--text-secondary]">End date (optional)</label>
                             <Input
                               name="expiresAt"
                               type="datetime-local"
                               defaultValue={promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : ""}
                             />
                           </div>
                           <div className="sm:col-span-2">
                             <label className="mb-1 block text-xs text-[--text-secondary]">Max global uses</label>
                             <Input
                               name="maxUses"
                               defaultValue={promo.maxUses ?? ""}
                               placeholder="Unlimited"
                             />
                           </div>
                        </div>

                        <Select
                          defaultValue={promo.isActive ? "true" : "false"}
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

                      <form action={togglePromoActiveAction}>
                        <input
                          name="promoId"
                          type="hidden"
                          value={promo.id}
                        />
                        <input
                          name="isActive"
                          type="hidden"
                          value={promo.isActive ? "false" : "true"}
                        />
                        <input
                          name="returnTo"
                          type="hidden"
                          value="/dashboard/promos"
                        />
                        <Button
                          className="w-full"
                          type="submit"
                          variant="surface"
                        >
                          {promo.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </details>
                )})}
              </div>
            ) : (
              <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-surface] p-6 text-sm text-[--text-secondary]">
                No promo codes yet. Create your first code using the form on the left.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
