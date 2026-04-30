import { NextResponse } from "next/server"
import { getAdminDb } from "@wongdigital/db/client"

export const runtime = "nodejs"

/**
 * Health check endpoint for uptime monitoring tools (e.g., UptimeRobot, Better Stack).
 * Returns application status and database connectivity.
 */
export async function GET() {
  const startTime = Date.now()

  let dbStatus: "ok" | "error" = "error"
  let dbLatencyMs = 0

  try {
    const supabase = getAdminDb()
    const dbStart = Date.now()
    const { error } = await supabase.from("store_settings").select("id").limit(1).single()
    dbLatencyMs = Date.now() - dbStart

    if (!error) {
      dbStatus = "ok"
    }
  } catch {
    dbStatus = "error"
  }

  const totalLatencyMs = Date.now() - startTime

  const isHealthy = dbStatus === "ok"

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
      latencyMs: totalLatencyMs,
    },
    { status: isHealthy ? 200 : 503 },
  )
}
