/*
  Supabase environment helpers (Phase 1b scaffolding — NOT wired to the app).

  All getters are LAZY: they read process.env only when CALLED, never at import
  time, so the app still builds/runs without Supabase envs set (nothing imports
  these into a live code path yet).

  Public vs secret:
    - NEXT_PUBLIC_SUPABASE_URL        → client-safe
    - NEXT_PUBLIC_SUPABASE_ANON_KEY   → client-safe (RLS-bound)
    - SUPABASE_SERVICE_ROLE_KEY       → SERVER-ONLY SECRET (bypasses RLS)
    - SUPABASE_STORAGE_BUCKET_RECORDINGS, NEXT_PUBLIC_APP_URL
*/

/** Throw if a server-only path is reached in the browser bundle. */
export function assertServerOnly(where: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `[supabase] ${where} is server-only and must never run in the browser. ` +
        `Do not import it into client components.`,
    );
  }
}

function missing(name: string): Error {
  return new Error(
    `[supabase] Missing required environment variable: ${name}. ` +
      `See .env.example / supabase/README.md.`,
  );
}

/** Client-safe Supabase URL + anon key (used by browser + server user clients).
 *  ⚠️ NEXT_PUBLIC_* must be read as STATIC member expressions — Next.js inlines
 *  them into the browser bundle only then. A dynamic `process.env[name]` lookup
 *  is never inlined and reads `undefined` in every browser. */
export function getPublicSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw missing("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw missing("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

/** SERVER-ONLY: the service role key. Never call this from client code. */
export function getServiceRoleKey(): string {
  assertServerOnly("getServiceRoleKey");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw missing("SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

/** Recordings bucket name (defaults to "recordings"). */
export function getRecordingsBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET_RECORDINGS || "recordings";
}

/** App base URL (for building /join links + auth redirects). */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * SERVER-ONLY optional "pepper" mixed into child-grant token hashing. Keeping it
 * server-side means a DB leak of grant_token_hash alone cannot be reversed/forged
 * without it. Optional for MVP (plain SHA-256 if unset — see grantToken.ts).
 */
export function getChildGrantPepper(): string | null {
  assertServerOnly("getChildGrantPepper");
  return process.env.CHILD_GRANT_TOKEN_PEPPER || null;
}
