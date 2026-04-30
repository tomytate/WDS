import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod-validated at the boundary (OWASP ASVS §5.1). `target` must be a tag name
// or an array of tag names; anything else is a 400.
const tagName = z.string().min(1).max(128).regex(/^[a-zA-Z0-9:_-]+$/);
const bodySchema = z.object({
  target: z.union([tagName, z.array(tagName).max(50)]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    // In production, configure SUPABASE_WEBHOOK_SECRET locally to match Supabase's webhook secret.
    // For local dev / testing if unconfigured, we will allow it to proceed or fallback.
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { target } = parsed.data;

    if (!target) {
      // Default to broadly revalidating the core tags
      revalidateTag("store-products", "max");
      revalidateTag("recent-orders", "max");
      return NextResponse.json({ revalidated: true, now: Date.now() });
    }

    if (Array.isArray(target)) {
      target.forEach((t) => revalidateTag(t, "max"));
    } else {
      revalidateTag(target, "max");
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { error: "Error revalidating" },
      { status: 500 }
    );
  }
}
