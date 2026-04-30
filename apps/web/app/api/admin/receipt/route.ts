import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAuthenticatedDashboardAdmin } from "@/lib/dashboard-auth"
import { getPrivateAsset } from "@/lib/vercel/blob"

export const dynamic = "force-dynamic"

// Zod schema — closes OWASP ASVS §5.1 (validation at the boundary).
// `pathname` must be a plausible blob path: no `..`, no leading slash, reasonable length.
const querySchema = z.object({
  pathname: z
    .string()
    .min(1, "pathname is required")
    .max(512, "pathname too long")
    .refine((value) => !value.includes(".."), "path traversal not allowed")
    .refine((value) => !value.startsWith("/"), "pathname must be relative"),
})

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedDashboardAdmin()

  if (!admin) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const parsed = querySchema.safeParse({
    pathname: request.nextUrl.searchParams.get("pathname"),
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { pathname } = parsed.data

  const receipt = await getPrivateAsset(
    pathname,
    request.headers.get("if-none-match"),
  )

  if (!receipt) {
    return new NextResponse("Not found", { status: 404 })
  }

  if (receipt.statusCode === 304) {
    return new NextResponse(null, {
      headers: {
        "Cache-Control": "private, no-cache",
        ETag: receipt.blob.etag,
      },
      status: 304,
    })
  }

  return new NextResponse(receipt.stream, {
    headers: {
      "Cache-Control": "private, no-cache",
      "Content-Type": receipt.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      ETag: receipt.blob.etag,
    },
  })
}
