/*
  Server-side protection for the /teacher area (Phase 2 — real Supabase Auth).

  Runs BEFORE any /teacher page renders (Next 16 proxy — the middleware
  convention). Responsibilities:
    1. Refresh the Supabase auth session (rotates cookies when needed).
    2. Redirect signed-out visitors on any protected /teacher route to
       /teacher/login — the dashboard HTML is never sent to a guest.
    3. Redirect an already-signed-in user away from /teacher/login to /teacher.

  The teacher ROLE check happens in the server layout (src/app/teacher/layout.tsx)
  via a profiles read under RLS — the proxy only guarantees "has a session".
  Old localStorage demo sessions play no part here: authorization is cookie-based.
*/
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Unified public sign-in page (outside /teacher, so outside this matcher).
const LOGIN_PATH = "/login";
// Legacy path kept as a redirect page → still needs the login carve-out here.
const TEACHER_LOGIN_PATH = "/teacher/login";

/** Copy any (possibly refreshed) auth cookies onto a redirect response. */
function redirectTo(pathname: string, request: NextRequest, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export async function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname.startsWith(TEACHER_LOGIN_PATH);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // No Supabase configured → nobody can be authenticated. Fail CLOSED:
    // only the login screen is reachable.
    return isLogin
      ? NextResponse.next({ request })
      : NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

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

  // getUser() VERIFIES the session with Supabase (never trust the raw cookie).
  // Any failure (expired, revoked, network) counts as signed out — fail closed.
  let user = null;
  try {
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null;
  }

  if (!user && !isLogin) return redirectTo(LOGIN_PATH, request, response);
  if (user && isLogin) return redirectTo("/teacher", request, response);
  return response;
}

export const config = {
  matcher: ["/teacher/:path*"],
};
