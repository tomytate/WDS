import { NextRequest } from "next/server"
import { z } from "zod"

import { getOrdersForExport } from "@wongdigital/db/storefront"
import {
  getAuthenticatedDashboardAdmin,
  isDashboardDevelopmentBypassEnabled,
} from "@/lib/dashboard-auth"

const querySchema = z.object({
  ids: z.string().optional(),
})

export async function GET(req: NextRequest) {
  // Auth check — require admin or dev bypass
  const isDev = isDashboardDevelopmentBypassEnabled()
  if (!isDev) {
    const admin = await getAuthenticatedDashboardAdmin()
    if (!admin) {
      return new Response("Unauthorized", { status: 401 })
    }
  }

  try {
    const url = new URL(req.url)
    const params = Object.fromEntries(url.searchParams)
    const { ids } = querySchema.parse(params)

    if (!ids) {
      return new Response("Missing ids parameter", { status: 400 })
    }

    const orderIdArray = ids.split(",").filter(Boolean)

    if (orderIdArray.length === 0) {
      return new Response("Empty ids parameter", { status: 400 })
    }

    const csvData = await getOrdersForExport(orderIdArray)

    // Generate CSV String
    const headers = [
      "Order Date",
      "Order Code",
      "Status",
      "Customer Name",
      "Email",
      "Phone",
      "Total Price",
      "Payment Ref",
      "Products",
    ]

    const escapeCsv = (str: string) => `"${String(str ?? "").replace(/"/g, '""')}"`

    type OrderExportRow = Awaited<ReturnType<typeof getOrdersForExport>>[number]

    const rows: string[][] = csvData.map((order: OrderExportRow) => {
      const dateStr = order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : String(order.createdAt)

      return [
        escapeCsv(dateStr),
        escapeCsv(order.orderCode),
        escapeCsv(order.status),
        escapeCsv(order.customerName),
        escapeCsv(order.customerEmail),
        escapeCsv(order.customerPhone || ""),
        escapeCsv(String(order.totalPrice)),
        escapeCsv(order.paymentReference || ""),
        escapeCsv(order.productNames.join(" + ")),
      ]
    })

    const csvStr = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const filename = `orders-export-${new Date().toISOString().split("T")[0]}.csv`
    const headersResp = new Headers()
    headersResp.set("Content-Type", "text/csv")
    headersResp.set("Content-Disposition", `attachment; filename="${filename}"`)

    return new Response(csvStr, {
      status: 200,
      headers: headersResp,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(`Error: ${message}`, { status: 500 })
  }
}
