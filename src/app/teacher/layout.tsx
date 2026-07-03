/*
  Shared shell for all /teacher/* routes (Phase 2 — real Supabase Auth).
  Desktop-first dashboard: one AppShell + desktop side-nav + mobile bottom-nav,
  a wide container, and a top utility bar (demo experience switcher + bell) on
  every teacher page. Each page renders only its own content.

  AUTH: the proxy (src/proxy.ts) already redirected signed-out visitors to
  /teacher/login. This SERVER layout then resolves the signed-in user's profile
  under RLS and derives the auth state:
    teacher     → dashboard shell + verified identity via TeacherIdentityProvider
    not-teacher → access-denied screen (signed in, wrong role)
    no-user     → nothing (client redirect fallback in TeacherShellGate)
  /teacher/login always renders standalone. localStorage never authorizes.
*/
import type { ReactNode } from "react";
import { AppShell, DemoExperienceSwitcher, NotificationBell } from "@/components";

// Auth is per-request (cookies) — never prerender any /teacher page at build
// time, or a page could ship with a baked-in "signed out" state.
export const dynamic = "force-dynamic";
import { getMockUser, getNotificationsForViewer, getPendingTeacherReviews } from "@/lib/data";
import { getCurrentUserProfile, getCurrentTeacherProfile } from "@/lib/backend/auth";
import { getOwnJoinRequest } from "@/lib/backend/joinRequests";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TeacherDesktopNav } from "./TeacherDesktopNav";
import { TeacherMobileNav } from "./TeacherMobileNav";
import { TeacherToolsDrawer } from "./TeacherToolsDrawer";
import { TeacherShellGate, type TeacherAuthState, type TeacherDeniedReason } from "./TeacherShellGate";
import type { TeacherIdentity } from "./TeacherIdentity";

/** Server-side auth state for the teacher area.
 *  IMPORTANT: only a truly missing SESSION maps to "no-user" (→ login redirect).
 *  A signed-in user with no/other-role profile is "not-teacher" (clear screen),
 *  and a real failure is "error" (clear screen) — mapping either of those to
 *  "no-user" creates a blank redirect ping-pong with the proxy (the login
 *  bounces the session back to /teacher forever). */
async function resolveTeacherAuth(): Promise<{
  authState: TeacherAuthState;
  teacher: TeacherIdentity | null;
  denied: TeacherDeniedReason;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { authState: "no-user", teacher: null, denied: null };

    // Session exists — from here on, never fall back to "no-user".
    const profile = await getCurrentUserProfile();
    if (!profile || profile.role !== "teacher") {
      // Signed in but not an approved teacher. If they have a join request,
      // show its state (pending/rejected) instead of the generic denial.
      const request = await getOwnJoinRequest().catch(() => null);
      const denied: TeacherDeniedReason =
        !profile && request?.status === "pending"
          ? "pending"
          : !profile && request?.status === "rejected"
            ? "rejected"
            : null;
      console.error(
        `[teacher-layout] signed-in user without teacher profile: hasProfile=${Boolean(profile)} role=${profile?.role ?? "none"} request=${request?.status ?? "none"}`,
      );
      return { authState: "not-teacher", teacher: null, denied };
    }
    const teacher = await getCurrentTeacherProfile();
    if (!teacher) return { authState: "not-teacher", teacher: null, denied: null };
    return {
      authState: "teacher",
      teacher: { id: teacher.id, displayName: teacher.display_name },
      denied: null,
    };
  } catch (error) {
    // Never swallow Next's control-flow errors (dynamic bailout, redirects).
    if (error && typeof error === "object" && "digest" in error) throw error;
    // Real failure (env, network, DB): show the error screen, log safely.
    console.error(
      "[teacher-layout] auth resolution failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
    );
    return { authState: "error", teacher: null, denied: null };
  }
}

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const { authState, teacher, denied } = await resolveTeacherAuth();

  // Demo data (notifications, pending reviews) still comes from the seed viewer
  // — the localStorage demo stores are untouched in this phase.
  const viewer = getMockUser("teacher");
  const seed = getNotificationsForViewer(viewer);
  const dbPendingReviews = getPendingTeacherReviews(viewer).length;

  const withShell = (
    <AppShell
      sidebar={<TeacherDesktopNav teacherId={viewer.id} dbPendingReviews={dbPendingReviews} />}
      mobileNav={<TeacherMobileNav teacherId={viewer.id} dbPendingReviews={dbPendingReviews} />}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {/* Mobile: burger → drawer with ALL teacher tools (desktop has the sidebar). */}
            <TeacherToolsDrawer teacherId={viewer.id} dbPendingReviews={dbPendingReviews} />
            <DemoExperienceSwitcher current="teacher" />
          </div>
          <NotificationBell userId={viewer.id} seed={seed} />
        </div>
        {children}
      </div>
    </AppShell>
  );

  return (
    <TeacherShellGate
      authState={authState}
      teacher={teacher}
      denied={denied}
      plain={children}
      withShell={withShell}
    />
  );
}
