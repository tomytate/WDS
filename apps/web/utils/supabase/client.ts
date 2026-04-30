import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseEnv } from "./shared"

export function createClient() {
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv()

  return createBrowserClient(supabaseUrl, supabasePublishableKey)
}
