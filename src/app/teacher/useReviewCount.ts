"use client";

import { useSubmissions } from "@/lib/demo/submissions";

/**
 * Live count of recitations awaiting THIS teacher's review:
 *   db pending (passed as seed) + demo submissions in `pending_teacher`.
 * Scoped to the teacher; only parent-approved submissions reach pending_teacher.
 */
export function useTeacherReviewCount(teacherId: string, dbPendingCount: number): number {
  const submissions = useSubmissions();
  const demoPending = Object.values(submissions).filter(
    (s) => s.teacherId === teacherId && s.state === "pending_teacher",
  ).length;
  return dbPendingCount + demoPending;
}
