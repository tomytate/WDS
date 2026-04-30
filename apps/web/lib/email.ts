import { Resend } from "resend"

import { OrderCompletedEmail } from "@/emails/order-completed"
import { OrderDeliveredEmail } from "@/emails/order-delivered"
import { OrderProcessingEmail } from "@/emails/order-processing"
import { OrderReceivedEmail } from "@/emails/order-received"

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_for_build_time")
const FROM_EMAIL = process.env.FROM_EMAIL || "Wong Digital Shop <orders@wongdigital.shop>"

export type OrderNotificationProps = {
  orderId: string
  orderCode: string
  customerEmail: string
  customerName: string
  productName: string
  status: "pending" | "processing" | "delivered" | "completed" | "cancelled"
  notes?: string | null
  items?: { name: string; quantity: number; price: string }[]
  totalPrice?: string
  paymentMethod?: string
}

export async function sendOrderStatusEmail(order: OrderNotificationProps) {
  // If no API key is configured, log and return (allows dev environment to function without crashing)
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email Mock] ${order.status} email intended for ${order.customerEmail}`)
    return { success: true, message: "Mocked (No API Key)" }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wongdigital.shop"
  let subject = ""
  let reactTemplate: React.ReactElement | null = null

  switch (order.status) {
    case "pending":
      subject = `Order Confirmed: ${order.orderCode} — Payment Received`
      reactTemplate = OrderReceivedEmail({
        orderCode: order.orderCode,
        customerName: order.customerName,
        items: order.items ?? [{ name: order.productName, quantity: 1, price: order.totalPrice ?? "—" }],
        totalPrice: order.totalPrice ?? "—",
        paymentMethod: order.paymentMethod ?? "Online Payment",
        trackOrderUrl: `${siteUrl}/track?orderCode=${order.orderCode}`,
      })
      break
    case "processing":
      subject = `Your Order ${order.orderCode} is Being Processed`
      reactTemplate = OrderProcessingEmail({
        orderCode: order.orderCode,
        customerName: order.customerName,
        trackOrderUrl: `${siteUrl}/track?orderCode=${order.orderCode}`,
        items: order.items,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
      })
      break
    case "delivered":
      subject = `Delivery Completed: Your Order ${order.orderCode}`
      reactTemplate = OrderDeliveredEmail({
        orderCode: order.orderCode,
        customerName: order.customerName,
        productName: order.productName,
        notes: order.notes ?? undefined,
        items: order.items,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
      })
      break
    case "completed":
      subject = `Thank you for your order! (Leave a Review)`
      reactTemplate = OrderCompletedEmail({
        orderCode: order.orderCode,
        customerName: order.customerName,
        reviewUrl: `${siteUrl}/review?orderCode=${order.orderCode}`,
      })
      break
    default:
      return { success: true, message: "No email template for this status" }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.customerEmail],
      subject,
      react: reactTemplate,
    })

    if (error) {
      console.error("[Email Error]", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Email Error]", message)
    return { success: false, error: message }
  }
}
