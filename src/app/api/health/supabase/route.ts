/*
  TEMPORARY safe diagnostics endpoint — /api/health/supabase (Phase 2 debugging).
  Returns ONLY booleans / pass-fail / short error codes. It NEVER returns env
  values, keys, tokens, or user data. Remove once teacher login is verified in
  production.
*/
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Health = {
  hasUrl: boolean;
  hasAnonKey: boolean;
  hasServiceRoleKey: boolean;
  canCreateBrowserClientConfig: boolean;
  canReachSupabase: boolean;
  profileQueryCheck: "pass" | "fail" | "skipped";
  errorCode: string | null;
  errorMessage: string | null;
};

export async function GET() {
  // Static reads (same rule the app itself relies on).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const out: Health = {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    hasServiceRoleKey: Boolean(serviceKey),
    canCreateBrowserClientConfig: Boolean(url && anonKey),
    canReachSupabase: false,
    profileQueryCheck: "skipped",
    errorCode: null,
    errorMessage: null,
  };

  if (url && anonKey) {
    try {
      const health = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: anonKey },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      out.canReachSupabase = health.ok;
      if (!health.ok) out.errorCode = `auth_health_${health.status}`;

      // Anon read of profiles: RLS policies are `to authenticated`, so this must
      // return 200 with ZERO rows (that's a pass — no data, no error).
      const query = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      out.profileQueryCheck = query.ok ? "pass" : "fail";
      if (!query.ok && !out.errorCode) out.errorCode = `rest_profiles_${query.status}`;
    } catch (error) {
      // Network/DNS/timeout — report the error CLASS and message only (no values).
      out.errorCode = out.errorCode ?? "fetch_failed";
      out.errorMessage =
        error instanceof Error ? `${error.name}: ${error.message}`.slice(0, 200) : "unknown";
    }
  }

  return NextResponse.json(out);
}
