/*
  TEMPORARY safe diagnostics endpoint — /api/health/supabase (Phase 2 debugging).
  Returns ONLY booleans / pass-fail / short error codes+messages. It NEVER
  returns env values, keys, tokens, emails, or user data. Remove once teacher
  login is verified in production.

  authFlowCheck exercises the REAL production path end-to-end on the server:
  create a throwaway auth user (service key) → password sign-in (publishable
  key) → read own profiles row via REST (publishable key + user JWT, RLS) →
  delete the throwaway user. Random credentials are generated in-memory and
  never returned.
*/
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const TIMEOUT = 8000;

function short(text: string): string {
  return text.replace(/\s+/g, " ").slice(0, 160);
}

/** Build the @supabase/ssr auth cookies for a session object (chunked like the
 *  browser client writes them), so we can request /teacher AS a signed-in user. */
function sessionCookies(supabaseUrl: string, session: unknown): string {
  const ref = new URL(supabaseUrl).hostname.split(".")[0];
  const name = `sb-${ref}-auth-token`;
  const encoded =
    "base64-" + Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const MAX = 3180; // @supabase/ssr chunk size
  if (encoded.length <= MAX) return `${name}=${encoded}`;
  const parts: string[] = [];
  for (let i = 0; i * MAX < encoded.length; i++) {
    parts.push(`${name}.${i}=${encoded.slice(i * MAX, (i + 1) * MAX)}`);
  }
  return parts.join("; ");
}

export async function GET(request: NextRequest) {
  // Static reads (same inlining rule the app itself relies on).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const out: Record<string, unknown> = {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    hasServiceRoleKey: Boolean(serviceKey),
    canCreateBrowserClientConfig: Boolean(url && anonKey),
    canReachSupabase: false,
    anonProfilesProbe: "skipped", // anon may be blocked (401) — that is fine/secure
    profileQueryCheck: "skipped", // authenticated-user read: the path the app uses
    authFlowCheck: "skipped",
    dashboardCheck: "skipped", // synthetic teacher session actually renders /teacher
    errorCode: null as string | null,
    errorMessage: null as string | null,
  };

  if (!url || !anonKey) return NextResponse.json(out);

  try {
    // 1) reachability (auth service, publishable key on apikey header only)
    const health = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT),
    });
    out.canReachSupabase = health.ok;
    if (!health.ok) {
      out.errorCode = `auth_health_${health.status}`;
      return NextResponse.json(out);
    }

    // 2) anon REST probe (expected: 200 with [] OR 401/blocked — both secure)
    const anonProbe = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: anonKey },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT),
    });
    out.anonProfilesProbe = anonProbe.ok
      ? "empty_200"
      : `blocked_${anonProbe.status}:${short(await anonProbe.text())}`;

    // 3) full auth flow (only when the service key is present, server-side)
    if (serviceKey) {
      let stage = "create";
      let userId: string | null = null;
      try {
        // random throwaway credentials — generated in memory, never returned
        const rand = crypto.randomUUID().replace(/-/g, "");
        const email = `healthcheck-${rand.slice(0, 12)}@alashbal.invalid`;
        const password = `Hc!${rand.slice(12, 32)}`;

        const created = await fetch(`${url}/auth/v1/admin/users`, {
          method: "POST",
          headers: { apikey: serviceKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, email_confirm: true }),
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT),
        });
        if (!created.ok) throw new Error(`status ${created.status}: ${short(await created.text())}`);
        userId = (await created.json()).id as string;

        stage = "signin";
        const signin = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: { apikey: anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT),
        });
        if (!signin.ok) throw new Error(`status ${signin.status}: ${short(await signin.text())}`);
        const sessionJson = (await signin.json()) as { access_token: string };
        const accessToken = sessionJson.access_token;

        stage = "profiles_read";
        // EXACTLY what the app does after login: publishable apikey + user JWT
        const read = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
          headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT),
        });
        if (!read.ok) throw new Error(`status ${read.status}: ${short(await read.text())}`);

        out.authFlowCheck = "pass";
        out.profileQueryCheck = "pass";

        // ---- dashboardCheck: link the throwaway user as a teacher, then
        // request /teacher WITH its session cookies — the page must render the
        // actual dashboard (Asma's exact path), not a blank/redirect. ----
        stage = "dashboard";
        try {
          for (const [table, row] of [
            ["profiles", { id: userId, role: "teacher", display_name: "فحص مؤقت" }],
            ["teacher_profiles", { id: userId }],
          ] as const) {
            const ins = await fetch(`${url}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                apikey: serviceKey,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify(row),
              cache: "no-store",
              signal: AbortSignal.timeout(TIMEOUT),
            });
            if (!ins.ok) throw new Error(`${table} insert ${ins.status}: ${short(await ins.text())}`);
          }
          const origin = request.nextUrl.origin;
          const page = await fetch(`${origin}/teacher`, {
            headers: { cookie: sessionCookies(url, sessionJson) },
            redirect: "manual",
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
          });
          const html = page.status === 200 ? await page.text() : "";
          out.dashboardCheck =
            page.status === 200 && html.includes("أدوات المعلم")
              ? "pass"
              : `fail_status_${page.status}${page.status === 200 ? "_no_dashboard_markup" : ""}`;
        } catch (dashError) {
          out.dashboardCheck = `fail:${short(
            dashError instanceof Error ? dashError.message : "unknown",
          )}`;
        }
      } catch (flowError) {
        out.authFlowCheck = `fail_${stage}`;
        out.profileQueryCheck = stage === "profiles_read" ? "fail" : "skipped";
        out.errorCode = `auth_flow_${stage}`;
        out.errorMessage =
          flowError instanceof Error ? short(flowError.message) : "unknown";
      } finally {
        // always try to remove the throwaway user
        if (userId) {
          await fetch(`${url}/auth/v1/admin/users/${userId}`, {
            method: "DELETE",
            headers: { apikey: serviceKey },
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT),
          }).catch(() => {});
        }
      }
    }
  } catch (error) {
    out.errorCode = out.errorCode ?? "fetch_failed";
    out.errorMessage =
      error instanceof Error ? short(`${error.name}: ${error.message}`) : "unknown";
  }

  return NextResponse.json(out);
}
