/*
  Submissions workflow data access (Phase 1b scaffolding — stubs; NOT wired).

  Submissions are unique per (child_id, assignment_id) (C2). parent_approvals,
  teacher_reviews, and points_ledger all reference submissions.id. State machine
  and authorization are enforced in these server actions (RLS keeps client writes
  off the table entirely).
*/
import { NotImplementedBackendError } from "./errors";
import type { Submission } from "../supabase/types";

/**
 * getSubmissionForChildAssignment — the single active submission for a (child,
 * assignment) pair (C2 — keyed by child+assignment, never by task globally).
 *   Caller: server. Auth: can_access_child OR class teacher. Input:
 *   { childId, assignmentId }. Output: Submission | null. Tables: submissions.
 */
export async function getSubmissionForChildAssignment(input: {
  childId: string;
  assignmentId: string;
}): Promise<Submission | null> {
  throw new NotImplementedBackendError("getSubmissionForChildAssignment", { input });
}

/**
 * approveSubmissionAsParent — parent approves / sends back, by submission id.
 *   Caller: server (parent). Auth: is_parent_of_child(submission.child_id).
 *   Input: { submissionId, decision }. Output: { state }. Tables: submissions
 *   (state transition) + parent_approvals (audit) in ONE transaction. Security:
 *   only the linked parent; only valid transitions from 'pending_parent'.
 */
export async function approveSubmissionAsParent(input: {
  submissionId: string;
  decision: "approved" | "rerecord";
}): Promise<{ state: "pending_teacher" | "rerecord" }> {
  throw new NotImplementedBackendError("approveSubmissionAsParent", { input });
}

/**
 * reviewSubmissionAsTeacher — teacher accepts / requests re-record, by submission id.
 *   Caller: server (teacher). Auth: is_child_in_teacher_class(submission.child_id).
 *   Input: { submissionId, decision, awardedPoints? }. Output: { state }. Tables:
 *   submissions (state) + teacher_reviews + points_ledger (source_id=submissionId,
 *   on 'accepted') in ONE transaction. Security: only the class teacher; points
 *   credited to the submission's child only.
 */
export async function reviewSubmissionAsTeacher(input: {
  submissionId: string;
  decision: "accepted" | "rerecord";
  awardedPoints?: number;
}): Promise<{ state: "accepted" | "rerecord" }> {
  throw new NotImplementedBackendError("reviewSubmissionAsTeacher", { input });
}
