import { getStoreSettings } from "@wongdigital/db/storefront"
import { Button, Card, CardContent, Input, PageHeader, Textarea } from "@wongdigital/ui"

import { saveStoreSettingsAction } from "@/app/(dashboard)/dashboard/actions"
import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { handlingHoursLabel } from "@/lib/urgency"

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function DashboardSettingsPage({
  searchParams,
}: SettingsPageProps) {
  const resolvedSearchParams = await searchParams
  const settings = await getStoreSettings()

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Settings"
        description="Storefront identity and payment instructions shown at checkout."
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <form
              action={saveStoreSettingsAction}
              className="grid gap-4"
            >
              <input
                name="returnTo"
                type="hidden"
                value="/dashboard/settings"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  defaultValue={settings.storeName}
                  name="storeName"
                  placeholder="Store name"
                  required
                />
                <Input
                  defaultValue={settings.supportEmail}
                  name="supportEmail"
                  placeholder="support@example.com"
                  required
                  type="email"
                />
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted] pt-2">QRPH · GCash / Maya</p>
              <Input
                defaultValue={settings.qrphNumber}
                name="qrphNumber"
                placeholder="QRPH mobile number"
              />
              <Textarea
                defaultValue={settings.qrphInstructions}
                name="qrphInstructions"
                placeholder="Explain how the buyer should pay via QRPH."
              />

              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted] pt-2">Binance Pay</p>
              <Input
                defaultValue={settings.binancePayId}
                name="binancePayId"
                placeholder="Binance Pay ID"
              />
              <Textarea
                defaultValue={settings.binanceInstructions}
                name="binanceInstructions"
                placeholder="Explain how the buyer should pay via Binance."
              />

              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                Checkout preview
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">
                What buyers will see
              </h2>
            </div>

            <div className="rounded-2xl border border-[--border] bg-[--bg-surface] p-5">
              <p className="font-display text-2xl tracking-tight">{settings.storeName}</p>
              <p className="mt-3 text-sm text-[--text-secondary]">Support: {settings.supportEmail}</p>
              <p className="mt-2 text-sm text-[--text-secondary]">QRPH: {settings.qrphNumber}</p>
              <p className="mt-3 text-sm leading-7 text-[--text-secondary]">
                {settings.qrphInstructions}
              </p>
              {settings.binancePayId && (
                <>
                  <p className="mt-3 text-sm text-[--text-secondary]">Binance Pay ID: {settings.binancePayId}</p>
                  <p className="mt-1 text-sm leading-7 text-[--text-secondary]">
                    {settings.binanceInstructions}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-[--border] bg-[--bg-surface] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[--text-muted]">
                Handling window
              </p>
              <p className="mt-2 text-lg text-[--text-primary]">{handlingHoursLabel}</p>
              <p className="mt-3 text-sm leading-7 text-[--text-secondary]">
                Used across the order flow, tracking page, and admin copy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
