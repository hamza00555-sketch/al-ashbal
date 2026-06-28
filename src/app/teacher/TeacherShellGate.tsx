"use client";

/*
  LOCAL DEMO teacher route gate. Picks between:
   - the standalone login (when on /teacher/login), and
   - the AppShell-wrapped dashboard (only when a local teacher session exists).
  A logged-out user on any other /teacher route is redirected to /teacher/login.

  NOT real security — this only gates the demo UI. Production must protect
  teacher routes on the server. See src/lib/demo/teacherSession.ts.
*/
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTeacherSession } from "@/lib/demo/teacherSession";
import { useHydrated } from "@/lib/demo/deviceChildren";

export function TeacherShellGate({ plain, withShell }: { plain: ReactNode; withShell: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useTeacherSession();

  const onLogin = Boolean(pathname && pathname.startsWith("/teacher/login"));
  const loggedIn = Boolean(session);

  useEffect(() => {
    if (hydrated && !onLogin && !loggedIn) {
      router.replace("/teacher/login");
    }
  }, [hydrated, onLogin, loggedIn, router]);

  // The login route renders standalone (no teacher shell).
  if (onLogin) return <>{plain}</>;

  // Before hydration or while redirecting a logged-out user, render nothing
  // from the teacher area (avoids flashing the dashboard to a guest).
  if (!hydrated || !loggedIn) return null;

  return <>{withShell}</>;
}
