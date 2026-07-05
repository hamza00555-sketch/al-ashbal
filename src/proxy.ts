/*
  Session keep-alive + /teacher protection (Next 16 proxy — the middleware
  convention). Runs for EVERY app route (static assets excluded), because this
  is the ONLY place refreshed auth cookies can be persisted:

  Supabase access tokens expire (~1h) and refresh tokens ROTATE on use. A
  Server Component (e.g. the /parent layout or the /login pre-check) CAN
  refresh a session in memory but CANNOT write the rotated cookies — the new
  refresh token would be lost and the session would die the next time the app
  is opened ("keeps asking me to log in"). So:
    1. Any request carrying auth cookies whose access token is EXPIRING gets a
       full getUser() here → @supabase/ssr refreshes and THIS proxy persists
       the rotated cookies on the response.
    2. Fresh tokens skip the network entirely (fast path — no added latency).
    3. /teacher/* keeps its gate: no session → /login; the layout remains the
       authoritative role check. Prefetches stay network-free.
*/
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOGIN_PATH = "/login";
const TEACHER_LOGIN_PATH = "/teacher/login";
/** Refresh ahead of expiry so a token never dies mid-render. */
const REFRESH_MARGIN_MS = 5 * 60_000;

/** Copy any (possibly refreshed) auth cookies onto a redirect response. */
function redirectTo(pathname: string, request: NextRequest, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

function authCookies(request: NextRequest) {
  return request.cookies
    .getAll()
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
}

/** Parse expires_at (epoch seconds) from the (possibly chunked) session cookie
 *  WITHOUT any network. Returns null when unparseable → treat as expiring. */
function sessionExpiresAtMs(request: NextRequest): number | null {
  try {
    const cookies = authCookies(request).filter((c) => !c.name.includes("-code-verifier"));
    if (!cookies.length) return null;
    // combine chunks: sb-x-auth-token, sb-x-auth-token.0, .1, ...
    const base = cookies[0].name.replace(/\.\d+$/, "");
    const chunks = cookies
      .filter((c) => c.name === base || c.name.startsWith(`${base}.`))
      .sort((a, b) => {
        const ai = Number(a.name.split(".").pop());
        const bi = Number(b.name.split(".").pop());
        return (Number.isNaN(ai) ? -1 : ai) - (Number.isNaN(bi) ? -1 : bi);
      })
      .map((c) => c.value)
      .join("");
    const json = chunks.startsWith("base64-")
      ? Buffer.from(chunks.slice(7), "base64").toString("utf8")
      : chunks;
    const session = JSON.parse(json) as { expires_at?: number };
    return typeof session.expires_at === "number" ? session.expires_at * 1000 : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isTeacherArea = path.startsWith("/teacher");
  const isTeacherLogin = path.startsWith(TEACHER_LOGIN_PATH);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // No Supabase configured → nobody can be authenticated. Teacher area fails
    // CLOSED; the rest of the app (demo/local) keeps working.
    return isTeacherArea && !isTeacherLogin
      ? NextResponse.redirect(new URL(LOGIN_PATH, request.url))
      : NextResponse.next({ request });
  }

  const hasCookies = authCookies(request).length > 0;

  // No session cookies at all → nothing to refresh; only the teacher gate acts.
  if (!hasCookies) {
    return isTeacherArea && !isTeacherLogin
      ? NextResponse.redirect(new URL(LOGIN_PATH, request.url))
      : NextResponse.next({ request });
  }

  // PREFETCH requests: never a network call (no auth-request storms). The
  // layouts re-verify server-side; presence was already established above.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-middleware-prefetch") === "1";
  if (isPrefetch) return NextResponse.next({ request });

  // FAST PATH: the access token is still comfortably valid → no network. The
  // layouts do the authoritative verification; nothing needs rotating yet.
  const expiresAtMs = sessionExpiresAtMs(request);
  const isFresh = expiresAtMs !== null && expiresAtMs - Date.now() > REFRESH_MARGIN_MS;
  if (isFresh) {
    // Signed-in visitor on the legacy teacher login path → straight to the app.
    if (isTeacherLogin) return NextResponse.redirect(new URL("/teacher", request.url));
    return NextResponse.next({ request });
  }

  // REFRESH PATH: token expiring/expired/unparseable → verify + rotate HERE,
  // where the new cookies can actually be persisted.
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null; // fail closed for the teacher gate below
  }

  if (isTeacherArea && !isTeacherLogin && !user) {
    return redirectTo(LOGIN_PATH, request, response);
  }
  if (isTeacherLogin && user) return redirectTo("/teacher", request, response);
  return response;
}

export const config = {
  // Everything except Next internals and static files — the session refresh
  // must run wherever the app might read the session.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|assets/|backgrounds/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2?)$).*)",
  ],
};
