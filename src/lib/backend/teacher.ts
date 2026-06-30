/*
  Teacher data access (Phase 1b scaffolding — stubs; NOT wired).
*/
import { NotImplementedBackendError } from "./errors";
import type { ClassRow, Child } from "../supabase/types";

/**
 * getTeacherClasses — classes the signed-in teacher belongs to.
 *   Caller: server (teacher). Auth: requireTeacher. Input: none. Output: ClassRow[].
 *   Tables: class_teachers ⨝ classes. Security: RLS `is_teacher_for_class`.
 */
export async function getTeacherClasses(): Promise<ClassRow[]> {
  throw new NotImplementedBackendError("getTeacherClasses");
}

/**
 * getTeacherRoster — children enrolled in the teacher's class.
 *   Caller: server (teacher). Auth: requireTeacher + class membership.
 *   Input: { classId }. Output: Child[]. Tables: class_students ⨝ children.
 *   Security: RLS `is_teacher_for_class` / `is_child_in_teacher_class`.
 */
export async function getTeacherRoster(input: { classId: string }): Promise<Child[]> {
  throw new NotImplementedBackendError("getTeacherRoster", { input });
}
