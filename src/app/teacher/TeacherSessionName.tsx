"use client";

/* The teacher's display name from the LOCAL login session (TCH- code gate).
   Falls back to the seed name until a session exists — keeps the page header and
   the «مسجل كمعلم» strip showing ONE identity instead of two. */
import { ResponsiveNameText } from "@/components";
import { useTeacherSession } from "@/lib/demo/teacherSession";

export function TeacherSessionName({ fallback }: { fallback: string }) {
  const session = useTeacherSession();
  return <ResponsiveNameText name={session?.displayName || fallback} />;
}
