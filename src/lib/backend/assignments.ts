/*
  Assignments — minimal REAL implementation (Phase 3 MVP).
  Teacher CRUD runs AS THE TEACHER under RLS (assignments_write_teacher).
  The child device reads the open assignment via its grant (admin-read) —
  children have no auth session by design.
*/
import { assertServerOnly } from "../supabase/env";
import { getSupabaseAdminClient } from "../supabase/admin";
import { getRequestSupabase, requireTeacher } from "./auth";
import { getMyDefaultClassId } from "./invitations";
import { validateChildDeviceGrant } from "./childDeviceGrants";
import { BackendValidationError } from "./errors";
import type { Assignment } from "../supabase/types";

/** createRecitationAssignment — a simple open recitation task for the class. */
export async function createRecitationAssignment(input: {
  title: string;
  points?: number | null;
}): Promise<Assignment> {
  const { teacherId } = await requireTeacher();
  const classId = await getMyDefaultClassId();
  if (!classId) throw new BackendValidationError("لا توجد حلقة مرتبطة بالمعلم");
  const title = input.title.trim().slice(0, 100);
  if (!title) throw new BackendValidationError("title required");
  const points = input.points != null ? Math.min(Math.max(Math.trunc(input.points), 0), 100) : null;
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      class_id: classId,
      teacher_id: teacherId,
      title,
      type: "recitation",
      submission_type: "audio",
      status: "active",
      points,
    })
    .select()
    .single();
  if (error || !data) throw new Error(`assignments insert failed: ${error?.message}`);
  return data;
}

/** The teacher's assignments (RLS-scoped). */
export async function listAssignmentsForTeacher(): Promise<Assignment[]> {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`assignments read failed: ${error.message}`);
  return data ?? [];
}

/** closeAssignment — teacher archives an open task (RLS write). */
export async function closeAssignment(assignmentId: string): Promise<void> {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { error } = await supabase
    .from("assignments")
    .update({ status: "closed" })
    .eq("id", assignmentId);
  if (error) throw new Error(`assignments update failed: ${error.message}`);
}

/** The LATEST open assignment for the child's class (grant-validated). */
export async function latestOpenAssignmentForChild(input: {
  childId: string;
  grantToken: string;
}): Promise<Assignment | null> {
  assertServerOnly("latestOpenAssignmentForChild");
  const grant = await validateChildDeviceGrant({
    childId: input.childId,
    rawToken: input.grantToken,
  });
  const admin = getSupabaseAdminClient();
  const { data: enrollment, error: enrErr } = await admin
    .from("class_students")
    .select("class_id")
    .eq("child_id", grant.child_id)
    .eq("status", "active")
    .limit(1);
  if (enrErr) throw new Error(`class_students read failed: ${enrErr.message}`);
  const classId = enrollment?.[0]?.class_id;
  if (!classId) return null;
  const { data, error } = await admin
    .from("assignments")
    .select("*")
    .eq("class_id", classId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`assignments read failed: ${error.message}`);
  return data?.[0] ?? null;
}
