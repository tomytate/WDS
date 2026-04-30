import { NextResponse } from "next/server"
import { getAdminDb } from "@wongdigital/db/client"
import { syncBoostingStatusesForOrderIds } from "@wongdigital/db/storefront"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminDb()

  // Fetch all order IDs that have at least one item still awaiting provider fulfillment
  const { data: rows, error } = await supabase
    .from("order_items")
    .select("order_id")
    .in("provider_status", ["pending", "in_progress", "awaiting"])

  if (error) {
    console.error("[sync-boosting] Failed to fetch pending order items:", error)
    return NextResponse.json({ error: "Failed to query order items" }, { status: 500 })
  }

  const orderIds: string[] = rows
    ? Array.from(new Set(rows.map((r: { order_id: string }) => r.order_id)))
    : []

  const synced = await syncBoostingStatusesForOrderIds(orderIds)

  return NextResponse.json({
    success: true,
    syncedCount: synced.length,
    checkedOrders: orderIds.length,
    timestamp: new Date().toISOString(),
  })
}
