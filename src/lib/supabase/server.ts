/*
  Server Supabase client bound to the CURRENT USER'S session (Phase 1b scaffolding
  — NOT wired yet).

  ⚠️ SERVER-ONLY. Uses next/headers cookies + the public anon key, so RLS still
  applies as the logged-in user (teacher/parent). Use this for reads/writes that
  should run AS the authenticated user. For operations that must bypass RLS use
  the admin client (admin.ts) instead — never the service role here.
*/
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertServerOnly, getPublicSupabaseEnv } from "./env";
import type { Database } from "./database";

/**
 * Create a request-scoped server client bound to the user's auth cookies.
 * Call inside a Server Component / Route Handler / Server Action.
 */
export async function createSupabaseServerClient() {
  assertServerOnly("createSupabaseServerClient");
  const { url, anonKey } = getPublicSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` from a Server Component is a no-op (cookies are read-only
          // there); session refresh is handled by middleware in a later phase.
        }
      },
    },
  });
}
