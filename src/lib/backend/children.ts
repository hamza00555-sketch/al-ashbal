/*
  Family/student registration + children reads (Phase 1b scaffolding — stubs).

  Registration runs SERVER-SIDE in ONE transaction (admin client) so the
  invitation counter guard, child creation, links, enrolment, and code/grant
  minting all succeed or roll back together.
*/
import { NotImplementedBackendError } from "./errors";
import type { Child } from "../supabase/types";

export interface ChildRegistrationInput {
  displayName: string;
  age?: number;
  level?: string;
  avatarUrl?: string;
}

/**
 * registerFamilyFromInvitation — parent + up to N children from a family code.
 *   Caller: anon → parent (registration RPC). Input: { code, parent, children[] }.
 *   Output: { childAccessCodes: { childId, code }[] }. Tables: profiles,
 *   parent_profiles, children, class_students, parent_child_links,
 *   child_access_codes, invitation_uses, invitations. Security: consumeFamilyInvitation
 *   guard + all inserts in one transaction.
 */
export async function registerFamilyFromInvitation(input: {
  code: string;
  parent: { displayName: string };
  children: ChildRegistrationInput[];
}): Promise<{ childAccessCodes: { childId: string; code: string }[] }> {
  throw new NotImplementedBackendError("registerFamilyFromInvitation", { input });
}

/**
 * registerStudentFromInvitation — one self-registered student from a STD code.
 *   Caller: anon (registration RPC). Input: { code, student }. Output:
 *   { childId, parentLinkCode, deviceGrantToken }. Tables: children, class_students,
 *   parent_link_codes, child_device_grants, invitation_uses, invitations. Security:
 *   consumeStudentInvitation single-use guard; mints a device grant (raw token
 *   returned once).
 */
export async function registerStudentFromInvitation(input: {
  code: string;
  student: ChildRegistrationInput;
}): Promise<{ childId: string; parentLinkCode: string; deviceGrantToken: string }> {
  throw new NotImplementedBackendError("registerStudentFromInvitation", { input });
}

/**
 * getParentChildren — children linked to the signed-in parent.
 *   Caller: server (parent). Auth: session role='parent'. Output: Child[].
 *   Tables: parent_child_links ⨝ children. Security: RLS `is_parent_of_child` —
 *   parent sees ONLY linked children.
 */
export async function getParentChildren(): Promise<Child[]> {
  throw new NotImplementedBackendError("getParentChildren");
}
