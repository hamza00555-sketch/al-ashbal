"use client";

/*
  Client frame for the /teacher area (Phase 2 — real Supabase Auth).

  The SERVER decides the auth state (proxy redirect + layout role check); this
  component only picks what to render for that state:
   - /teacher/login → the standalone login (no shell), whatever the state;
   - "teacher"      → the dashboard shell, with the verified identity provided
                      to client components via TeacherIdentityProvider;
   - "not-teacher"  → the access-denied screen (signed in, wrong role);
   - "no-user"      → nothing + a client redirect to /teacher/login (belt &
                      suspenders — the proxy normally redirects before render).
  localStorage plays NO part in this decision.
*/
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TeacherIdentityProvider, type TeacherIdentity } from "./TeacherIdentity";
import { TeacherAccessDenied } from "./TeacherAccessDenied";
import { TeacherAreaError } from "./TeacherAreaError";

export type TeacherAuthState = "no-user" | "not-teacher" | "teacher" | "error";

export function TeacherShellGate({
  authState,
  teacher,
  plain,
  withShell,
}: {
  authState: TeacherAuthState;
  teacher: TeacherIdentity | null;
  plain: ReactNode;
  withShell: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = Boolean(pathname && pathname.startsWith("/teacher/login"));

  useEffect(() => {
    if (!onLogin && authState === "no-user") {
      router.replace("/teacher/login");
    }
  }, [onLogin, authState, router]);

  // The login route renders standalone (no teacher shell).
  if (onLogin) return <>{plain}</>;

  if (authState === "error") return <TeacherAreaError />;
  if (authState === "no-user") {
    // Redirecting to login (proxy fallback). Never a dead-blank screen.
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <p className="text-body text-on-dark-muted">جاري التحويل لصفحة الدخول...</p>
      </main>
    );
  }
  if (authState === "not-teacher" || !teacher) return <TeacherAccessDenied />;

  return <TeacherIdentityProvider value={teacher}>{withShell}</TeacherIdentityProvider>;
}
