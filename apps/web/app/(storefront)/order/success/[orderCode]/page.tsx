import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { lookupOrdersByCode, getStoreSettings } from "@wongdigital/db/storefront"

import { Footer } from "@/components/storefront/footer"
import { Navbar } from "@/components/storefront/navbar"
import { OrderSuccess } from "@/components/storefront/order-success"
import { formatOrderItemMeta, formatPrice } from "@/lib/format"
import { siteConfig } from "@/lib/site"
import { verifyOrderToken } from "@/lib/token"

export const metadata: Metadata = {
  title: "Order Received",
  description: "We've received your Wong Digital order. We'll process it shortly.",
}

type OrderSuccessPageProps = {
  params: Promise<{
    orderCode: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { orderCode } = resolvedParams
  const token = typeof resolvedSearchParams?.token === "string" ? resolvedSearchParams.token : undefined
  const safeOrderCode = orderCode.toUpperCase()

  const [orders, storeSettings] = await Promise.all([
    lookupOrdersByCode(safeOrderCode),
    getStoreSettings(),
  ])

  const order = orders[0]

  if (!order) {
    notFound()
  }

  const itemsFormatted = order.items.map((item) => {
    return `${item.product.name} (${formatOrderItemMeta({
      selectionMode: item.selectionMode,
      quantity: item.quantity,
      accessPlan: item.accessPlan,
      serviceOption: item.serviceOption,
    })})`
  })

  const isAuthorized = verifyOrderToken(safeOrderCode, token)

  const summary = isAuthorized
    ? {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        paymentReference: order.paymentMethod,
        totalPrice: formatPrice(order.totalPrice),
        items: itemsFormatted,
      }
    : {
        customerName: "Customer",
        customerEmail: "Hidden for privacy",
        paymentReference: "Hidden",
        totalPrice: "Hidden",
        items: ["Items hidden for privacy. Track your order for details."],
      }

  return (
    <main>
      <Navbar />
      <section className="container-shell py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <OrderSuccess
            orderCode={order.orderCode}
            firstProductSlug={order.items[0]?.product?.slug}
            summary={summary}
            supportEmail={storeSettings.supportEmail}
            supportFacebookUrl={siteConfig.facebookSupportUrl}
            supportTelegramUrl={siteConfig.telegramSupportUrl}
          />
        </div>
      </section>
      <Footer />
    </main>
  )
}
