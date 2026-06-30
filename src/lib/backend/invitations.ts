/*
  Invitations data access (Phase 1b scaffolding — stubs; NOT wired).

  Security model (from the plan + audit):
    - Codes are SERVER-generated with entropy; clients never write counters.
    - validateInvitationCode is the ONLY anon-reachable lookup and returns a
      PUBLIC-SAFE projection for ONE code (no table scan); rate-limited.
    - consume* run as ONE transaction with the atomic counter guard (admin client)
      so concurrent uses cannot exceed limits / reuse a single-use student code.
*/
import { NotImplementedBackendError } from "./errors";
import type { Invitation, InvitationPublic, InvitationType } from "../supabase/types";

/**
 * createTeacherInvitation — teacher mints a family/student invitation.
 *   Caller: server (teacher). Auth: requireTeacher + is_teacher_for_class.
 *   Input: { classId, type, label?, maxChildren, maxParents, expiresDays }.
 *   Output: Invitation (+ a /join link built by the caller). Tables: invitations
 *   (insert; retry on unique-violation). Security: created_by_teacher_id = caller.
 */
export async function createTeacherInvitation(input: {
  classId: string;
  type: InvitationType;
  label?: string;
  maxChildren: number;
  maxParents: number;
  expiresDays: number;
}): Promise<Invitation> {
  throw new NotImplementedBackendError("createTeacherInvitation", { input });
}

/**
 * revokeTeacherInvitation — set revoked_at.
 *   Caller: server (teacher, creator only). Tables: invitations (update).
 */
export async function revokeTeacherInvitation(input: {
  invitationId: string;
}): Promise<void> {
  throw new NotImplementedBackendError("revokeTeacherInvitation", { input });
}

/**
 * validateInvitationCode — anon-safe lookup for the /join screen.
 *   Caller: anon (via SECURITY DEFINER RPC, rate-limited). Input: { code }.
 *   Output: InvitationPublic | null (NO internal ids). Tables: invitations (one
 *   row). Security: no enumeration; returns only public-safe fields + status.
 */
export async function validateInvitationCode(input: {
  code: string;
}): Promise<InvitationPublic | null> {
  throw new NotImplementedBackendError("validateInvitationCode", { input });
}

/**
 * consumeFamilyInvitation — atomically reserve N child slots on a family code.
 *   Caller: server (registration RPC). Input: { code, childrenCount, parentsCount }.
 *   Output: { invitationId }. Tables: invitations (atomic counter guard). Security:
 *   `used_children_count + N <= max_children` in one transaction; throws
 *   BackendConflictError otherwise. (Child rows created by registerFamily*.)
 */
export async function consumeFamilyInvitation(input: {
  code: string;
  childrenCount: number;
  parentsCount: number;
}): Promise<{ invitationId: string }> {
  throw new NotImplementedBackendError("consumeFamilyInvitation", { input });
}

/**
 * consumeStudentInvitation — atomically mark a student code single-used.
 *   Caller: server (registration RPC). Input: { code }. Output: { invitationId }.
 *   Tables: invitations. Security: conditional `used_children_count < max_children`
 *   UPDATE; a second attempt affects 0 rows → BackendConflictError ("already used").
 */
export async function consumeStudentInvitation(input: {
  code: string;
}): Promise<{ invitationId: string }> {
  throw new NotImplementedBackendError("consumeStudentInvitation", { input });
}
