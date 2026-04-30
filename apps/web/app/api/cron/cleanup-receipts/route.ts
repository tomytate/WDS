import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { deleteReceiptAssetsOlderThan } from "@/lib/vercel/blob"

export const runtime = "nodejs"

// Retention value sanitised through Zod — rejects NaN, negatives, and absurd values.
const retentionSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(3650) // 10 years max — anything higher is almost certainly a typo
  .catch(14)

function getRetentionDays() {
  return retentionSchema.parse(process.env.RECEIPT_RETENTION_DAYS ?? "14")
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse("BLOB_READ_WRITE_TOKEN is not configured.", { status: 500 })
  }

  const authHeader = request.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const retentionDays = getRetentionDays()
  const deletedCount = await deleteReceiptAssetsOlderThan(retentionDays)

  return NextResponse.json({
    deletedCount,
    ok: true,
    retentionDays,
  })
}
