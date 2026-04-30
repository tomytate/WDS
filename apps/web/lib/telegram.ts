import "server-only"

import type { OrderWithProducts } from "@wongdigital/db"

import { formatOrderItemMeta, formatPrice } from "@/lib/format"
import { decodePrivateReceiptPath } from "@/lib/vercel/blob"
import { siteConfig } from "@/lib/site"

const appUrl = siteConfig.url

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim()
const telegramMessageThreadId = process.env.TELEGRAM_MESSAGE_THREAD_ID?.trim()

function hasTelegramConfig() {
  return Boolean(telegramBotToken && telegramChatId)
}

function buildTelegramApiUrl(method: string) {
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is required.")
  }

  return `https://api.telegram.org/bot${telegramBotToken}/${method}`
}

function appendTelegramTarget(formData: FormData) {
  if (!telegramChatId) {
    throw new Error("TELEGRAM_CHAT_ID is required.")
  }

  formData.append("chat_id", telegramChatId)

  if (telegramMessageThreadId) {
    formData.append("message_thread_id", telegramMessageThreadId)
  }
}

async function callTelegram(method: string, body: FormData) {
  const response = await fetch(buildTelegramApiUrl(method), {
    method: "POST",
    body,
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => null)) as
    | {
        ok?: boolean
        description?: string
      }
    | null

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.description || `Telegram ${method} request failed.`)
  }
}

function buildTelegramOrderMessage(order: OrderWithProducts) {
  const itemLines = order.items.map((item) => {
    const line = `${item.product.name} (${formatOrderItemMeta(item)}) - ${formatPrice(item.unitPrice)}`

    if (item.selectionMode === "service" && item.targetUrl) {
      return `${line}\nTarget: ${item.targetUrl}`
    }

    return line
  })

  const receiptPathname = decodePrivateReceiptPath(order.receiptPath)
  const receiptLink = receiptPathname 
    ? `${appUrl}/api/admin/receipt?pathname=${encodeURIComponent(receiptPathname)}`
    : "No receipt uploaded"

  return [
    "New paid order received.",
    "",
    `Order Code: ${order.orderCode}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone || "N/A"}`,
    `Payment Method: ${order.paymentMethod.toUpperCase()}`,
    `Payment Reference: ${order.paymentReference || "N/A"}`,
    `Receipt Link: ${receiptLink}`,
    `Subtotal: ${formatPrice(order.subtotalPrice)}`,
    `Tip: ${formatPrice(order.tipAmount)}`,
    `Grand Total: ${formatPrice(order.totalPrice)}`,
    "",
    "Items:",
    ...(itemLines.length > 0 ? itemLines.map((line) => `- ${line}`) : ["- No items"]),
    "",
    "Check the dashboard for fulfillment and receipt review.",
  ].join("\n")
}

async function sendTelegramMessage(text: string) {
  const formData = new FormData()
  appendTelegramTarget(formData)
  formData.append("text", text)

  await callTelegram("sendMessage", formData)
}

export async function sendTelegramOrderAlert({
  order,
}: {
  order: OrderWithProducts
}) {
  if (!hasTelegramConfig()) {
    return
  }

  await sendTelegramMessage(buildTelegramOrderMessage(order))
}
