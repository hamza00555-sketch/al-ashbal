/*
  Parent approvals + teacher reviews + points (Phase 3 MVP).

  State machine: pending_parent → (parent approves) pending_teacher →
  (teacher accepts) accepted [+ points_ledger] | (either asks) rerecord.

  Writes run under the ACTOR'S OWN RLS wherever a policy exists
  (parent_approvals insert, teacher_reviews write, points_ledger insert);
  ONLY the submissions.state transition uses the admin client — always behind
  a server-side authorization check + a conditional state guard.
*/
import { assertServerOnly } from "../supabase/env";
import { getSupabaseAdminClient } from "../supabase/admin";
import { getRequestSupabase, getSessionUser, getCurrentUserProfile, requireTeacher } from "./auth";
import { BackendConflictError, BackendPermissionError } from "./errors";
import type { Submission } from "../supabase/types";

/** Transition a submission's state with an optimistic guard on the FROM state. */
async function transition(
  submissionId: string,
  from: Submission["state"],
  to: Submission["state"],
  patch: Partial<Submission> = {},
): Promise<Submission> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .update({ state: to, ...patch })
    .eq("id", submissionId)
    .eq("state", from)
    .select()
    .single();
  if (error || !data) {
    throw new BackendConflictError(`submission is not in ${from} anymore`);
  }
  return data;
}

/** The signed-in parent must be linked to the submission's child (RLS read). */
async function requireParentForSubmission(submissionId: string): Promise<{
  parentId: string;
  submission: Submission;
}> {
  const user = await getSessionUser();
  const profile = await getCurrentUserProfile();
  if (!user || profile?.role !== "parent") {
    throw new BackendPermissionError("not a parent session");
  }
  const supabase = await getRequestSupabase();
  // RLS submissions_select (can_access_child) — visible ⇒ it's their child.
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw new Error(`submission read failed: ${error.message}`);
  if (!data) throw new BackendPermissionError("submission not accessible");
  return { parentId: user.id, submission: data };
}

/** parentApproveSubmission — pending_parent → pending_teacher (+approval row). */
export async function parentApproveSubmission(submissionId: string): Promise<void> {
  assertServerOnly("parentApproveSubmission");
  const { parentId } = await requireParentForSubmission(submissionId);
  const supabase = await getRequestSupabase();
  // RLS insert policy re-checks parent_id = uid AND is_parent_of_child.
  const { error } = await supabase.from("parent_approvals").insert({
    submission_id: submissionId,
    parent_id: parentId,
    decision: "approved",
  });
  if (error) throw new Error(`parent_approvals insert failed: ${error.message}`);
  await transition(submissionId, "pending_parent", "pending_teacher");
}

/** parentRequestRerecord — pending_parent → rerecord (+approval row w/ note). */
export async function parentRequestRerecord(
  submissionId: string,
  note?: string,
): Promise<void> {
  assertServerOnly("parentRequestRerecord");
  const { parentId } = await requireParentForSubmission(submissionId);
  const supabase = await getRequestSupabase();
  const { error } = await supabase.from("parent_approvals").insert({
    submission_id: submissionId,
    parent_id: parentId,
    decision: "rerecord",
    note: (note ?? "").trim().slice(0, 300) || null,
  });
  if (error) throw new Error(`parent_approvals insert failed: ${error.message}`);
  await transition(submissionId, "pending_parent", "rerecord", {
    note: (note ?? "").trim().slice(0, 300) || null,
  });
}

/** The teacher must be able to see the submission (RLS read) + be a teacher. */
async function requireTeacherForSubmission(submissionId: string): Promise<{
  teacherId: string;
  submission: Submission;
}> {
  const { teacherId } = await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw new Error(`submission read failed: ${error.message}`);
  if (!data) throw new BackendPermissionError("submission not accessible");
  return { teacherId, submission: data };
}

/** teacherAcceptSubmission — pending_teacher → accepted (+review +points). */
export async function teacherAcceptSubmission(input: {
  submissionId: string;
  points: number;
  note?: string;
}): Promise<void> {
  assertServerOnly("teacherAcceptSubmission");
  const { teacherId, submission } = await requireTeacherForSubmission(input.submissionId);
  const points = Math.min(Math.max(Math.trunc(input.points) || 0, 0), 100);
  const note = (input.note ?? "").trim().slice(0, 300) || null;
  const supabase = await getRequestSupabase();

  // RLS: teacher_reviews_write re-checks teacher + child-in-class.
  const { error: revErr } = await supabase.from("teacher_reviews").insert({
    submission_id: submission.id,
    teacher_id: teacherId,
    decision: "accepted",
    awarded_points: points,
    note,
  });
  if (revErr) throw new Error(`teacher_reviews insert failed: ${revErr.message}`);

  if (points > 0) {
    // RLS: points_insert_teacher re-checks is_child_in_teacher_class.
    const { error: ledgerErr } = await supabase.from("points_ledger").insert({
      child_id: submission.child_id,
      class_id: submission.class_id,
      teacher_id: teacherId,
      value: points,
      reason: "تسميع مقبول",
      category: "recitation",
      source_type: "submission",
      source_id: submission.id,
    });
    if (ledgerErr) throw new Error(`points_ledger insert failed: ${ledgerErr.message}`);
  }

  await transition(submission.id, "pending_teacher", "accepted", {
    teacher_id: teacherId,
    points,
    note,
  });
}

/** teacherRequestRerecord — pending_teacher → rerecord (+review row). */
export async function teacherRequestRerecord(input: {
  submissionId: string;
  note?: string;
}): Promise<void> {
  assertServerOnly("teacherRequestRerecord");
  const { teacherId, submission } = await requireTeacherForSubmission(input.submissionId);
  const note = (input.note ?? "").trim().slice(0, 300) || null;
  const supabase = await getRequestSupabase();
  const { error } = await supabase.from("teacher_reviews").insert({
    submission_id: submission.id,
    teacher_id: teacherId,
    decision: "rerecord",
    awarded_points: 0,
    note,
  });
  if (error) throw new Error(`teacher_reviews insert failed: ${error.message}`);
  await transition(submission.id, "pending_teacher", "rerecord", {
    teacher_id: teacherId,
    note,
  });
}

/** Total points per child (RLS read — parent sees own children, teacher class). */
export async function pointsTotalsByChild(): Promise<Record<string, number>> {
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("points_ledger")
    .select("child_id,value")
    .limit(1000);
  if (error) throw new Error(`points_ledger read failed: ${error.message}`);
  const totals: Record<string, number> = {};
  for (const row of data ?? []) {
    totals[row.child_id] = (totals[row.child_id] ?? 0) + row.value;
  }
  return totals;
}
