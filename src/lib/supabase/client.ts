/*
  Browser Supabase client (Phase 1b scaffolding — NOT wired to the app yet).

  Uses ONLY the public env vars (URL + anon key); all access is RLS-bound. Safe to
  import in client components in future phases. Created lazily so the app builds
  without Supabase envs (nothing imports this into a live path yet).
*/
import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "./env";
import type { Database } from "./database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Get (or lazily create) the singleton browser Supabase client. */
export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getPublicSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
