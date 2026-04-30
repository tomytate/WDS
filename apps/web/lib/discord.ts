import "server-only"

import type { OrderWithProducts } from "@wongdigital/db"

import { formatOrderItemMeta, formatPrice } from "@/lib/format"
import { decodePrivateReceiptPath } from "@/lib/vercel/blob"
import { siteConfig } from "@/lib/site"

const appUrl = siteConfig.url

function getTransactionsWebhook() {
  return process.env.DISCORD_TRANSACTIONS_WEBHOOK_URL?.trim()
}

function getReceiptWebhook() {
  return process.env.DISCORD_RECEIPT_WEBHOOK_URL?.trim()
}

function hasDiscordConfig() {
  return Boolean(getTransactionsWebhook())
}

function buildDiscordTransactionEmbed(order: OrderWithProducts) {
  const itemLines = order.items.map((item) => {
    const line = `**${item.product.name}** (${formatOrderItemMeta(item)}) — ${formatPrice(item.unitPrice)}`

    if (item.selectionMode === "service" && item.targetUrl) {
      return `${line}\n↳ Target: ${item.targetUrl}`
    }

    return line
  })

  const receiptPathname = decodePrivateReceiptPath(order.receiptPath)
  const receiptLink = receiptPathname
    ? `${appUrl}/api/admin/receipt?pathname=${encodeURIComponent(receiptPathname)}`
    : null

  return {
    embeds: [
      {
        title: "💰 New Paid Order",
        color: 0x00d4aa, // accent green
        fields: [
          {
            name: "📋 Order Code",
            value: `\`${order.orderCode}\``,
            inline: true,
          },
          {
            name: "💳 Payment",
            value: `${order.paymentMethod.toUpperCase()}\nRef: \`${order.paymentReference || "N/A"}\``,
            inline: true,
          },
          {
            name: "👤 Customer",
            value: `${order.customerName}\n${order.customerEmail}${order.customerPhone ? `\n${order.customerPhone}` : ""}`,
            inline: false,
          },
          {
            name: "🛒 Items",
            value:
              itemLines.length > 0
                ? itemLines.join("\n")
                : "No items",
            inline: false,
          },
          {
            name: "💵 Subtotal",
            value: formatPrice(order.subtotalPrice),
            inline: true,
          },
          {
            name: "🎁 Tip",
            value: formatPrice(order.tipAmount),
            inline: true,
          },
          {
            name: "💎 Grand Total",
            value: `**${formatPrice(order.totalPrice)}**`,
            inline: true,
          },
        ],
        footer: {
          text: "Wong Digital Shop Dashboard",
        },
        timestamp: new Date().toISOString(),
        ...(receiptLink
          ? {
              url: receiptLink,
            }
          : {}),
      },
    ],
  }
}

async function sendDiscordTransactionAlert(order: OrderWithProducts) {
  const url = getTransactionsWebhook()
  if (!url) return

  const payload = buildDiscordTransactionEmbed(order)

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error")
    throw new Error(`Discord transactions webhook failed (${response.status}): ${text}`)
  }
}

async function sendDiscordReceiptImage(order: OrderWithProducts, receiptFile: File | null) {
  const url = getReceiptWebhook()
  if (!url) return

  const formData = new FormData()

  const caption = [
    `📄 **Receipt for Order \`${order.orderCode}\`**`,
    `Customer: ${order.customerName} (${order.customerEmail})`,
    `Total: **${formatPrice(order.totalPrice)}**`,
    `Ref: \`${order.paymentReference || "N/A"}\``,
  ].join("\n")

  // If we have the raw receipt file, attach it directly
  if (receiptFile && receiptFile.size > 0) {
    formData.append("file", receiptFile, `receipt-${order.orderCode}${getFileExtension(receiptFile.type)}`)
    formData.append(
      "payload_json",
      JSON.stringify({ content: caption }),
    )
  } else {
    // Fallback: send the receipt link as a message
    const receiptPathname = decodePrivateReceiptPath(order.receiptPath)
    const receiptLink = receiptPathname
      ? `${appUrl}/api/admin/receipt?pathname=${encodeURIComponent(receiptPathname)}`
      : null

    if (!receiptLink) return

    formData.append(
      "payload_json",
      JSON.stringify({
        content: `${caption}\n\n🔗 [View Receipt](${receiptLink})`,
      }),
    )
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error")
    throw new Error(`Discord receipt webhook failed (${response.status}): ${text}`)
  }
}

function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "application/pdf":
      return ".pdf"
    default:
      return ".bin"
  }
}

export async function sendDiscordOrderAlert({
  order,
  receiptFile,
}: {
  order: OrderWithProducts
  receiptFile: File | null
}) {
  if (!hasDiscordConfig()) return

  // Fire both webhooks in parallel
  await Promise.allSettled([
    sendDiscordTransactionAlert(order),
    sendDiscordReceiptImage(order, receiptFile),
  ])
}
