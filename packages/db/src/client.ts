import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * NOTE: `database.types.ts` is currently out of date relative to
 * `supabase/schema.sql` (missing `wallet_transactions`, `texts`; stale
 * column lists on `orders`, `customers`, `store_settings`). Until it is
 * regenerated via `supabase gen types typescript`, the client is typed
 * permissively so callers don't trip on absent tables. Do NOT leak `any`
 * beyond query wrappers — narrow results at the call site.
 */
export type Db = SupabaseClient;

let supabaseInstance: Db | null = null;
let adminSupabaseInstance: Db | null = null;

/**
 * True when the public Supabase URL and anon key are both set.
 * (The former name `hasDatabaseUrl` was misleading — this checks the
 * REST-client env vars, not `DATABASE_URL`.)
 */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** @deprecated Use `hasSupabaseEnv`. */
export const hasDatabaseUrl = hasSupabaseEnv;

export function getDb(): Db {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: { persistSession: false },
      },
    );
  }

  return supabaseInstance;
}

export function getAdminDb(): Db {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin operations",
    );
  }
  if (!adminSupabaseInstance) {
    adminSupabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );
  }
  return adminSupabaseInstance;
}

export async function closeDb(): Promise<void> {
  supabaseInstance = null;
  adminSupabaseInstance = null;
}
