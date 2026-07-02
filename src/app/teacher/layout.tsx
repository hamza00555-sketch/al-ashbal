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
import { TeacherDesktopNav } from "./TeacherDesktopNav";
import { TeacherMobileNav } from "./TeacherMobileNav";
import { TeacherShellGate, type TeacherAuthState } from "./TeacherShellGate";
import type { TeacherIdentity } from "./TeacherIdentity";

/** Server-side auth state for the teacher area. Any failure → signed out. */
async function resolveTeacherAuth(): Promise<{
  authState: TeacherAuthState;
  teacher: TeacherIdentity | null;
}> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return { authState: "no-user", teacher: null };
    if (profile.role !== "teacher") return { authState: "not-teacher", teacher: null };
    const teacher = await getCurrentTeacherProfile();
    if (!teacher) return { authState: "not-teacher", teacher: null };
    return {
      authState: "teacher",
      teacher: { id: teacher.id, displayName: teacher.display_name },
    };
  } catch (error) {
    // Never swallow Next's control-flow errors (dynamic bailout, redirects).
    if (error && typeof error === "object" && "digest" in error) throw error;
    // Missing env / Supabase unreachable → fail CLOSED (treat as signed out).
    return { authState: "no-user", teacher: null };
  }
}

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const { authState, teacher } = await resolveTeacherAuth();

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
          <DemoExperienceSwitcher current="teacher" />
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
      plain={children}
      withShell={withShell}
    />
  );
}
