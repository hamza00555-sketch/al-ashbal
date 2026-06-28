"use client";

/* Small "logged in as teacher" strip + calm logout (LOCAL DEMO gate). */
import { useRouter } from "next/navigation";
import { Card } from "@/components";
import { clearActiveTeacherSession, useTeacherSession } from "@/lib/demo/teacherSession";

export function TeacherIdentityStrip() {
  const router = useRouter();
  const session = useTeacherSession();
  if (!session) return null;

  function logout() {
    clearActiveTeacherSession();
    router.replace("/teacher/login");
  }

  return (
    <Card variant="lavender" className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <span className="text-caption text-on-dark-muted">
        مسجل كمعلم: <span className="font-bold text-on-dark">{session.displayName}</span>
      </span>
      <button
        type="button"
        onClick={logout}
        className="text-caption font-bold text-purple-soft underline-offset-4 transition hover:text-purple hover:underline"
      >
        تسجيل خروج
      </button>
    </Card>
  );
}
