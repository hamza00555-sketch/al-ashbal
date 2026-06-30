/*
  Admin / service-role Supabase client (Phase 1b scaffolding — NOT wired yet).

  ⚠️⚠️ SERVER-ONLY SECRET. This client uses the SUPABASE_SERVICE_ROLE_KEY and
  BYPASSES Row Level Security. NEVER import this module into a client component or
  anything that reaches the browser bundle. Use it ONLY inside server actions /
  Route Handlers for operations that genuinely need to bypass RLS after the server
  has performed its OWN authorization (e.g. invitation consumption with the atomic
  counter guard, or acting for a child AFTER validating its device grant).

  Guardrails: assertServerOnly() throws if this ever runs in the browser, and the
  service key getter is server-only.
*/
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertServerOnly, getPublicSupabaseEnv, getServiceRoleKey } from "./env";
import type { Database } from "./database";

let adminClient: SupabaseClient<Database> | null = null;

/** Get (or lazily create) the server-only service-role client. Bypasses RLS. */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  assertServerOnly("getSupabaseAdminClient");
  if (adminClient) return adminClient;
  const { url } = getPublicSupabaseEnv();
  adminClient = createClient<Database>(url, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
