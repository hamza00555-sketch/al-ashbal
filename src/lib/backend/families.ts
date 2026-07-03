/*
  Family registration via invitation — REAL implementation (Phase 2).

  ⚠️ SERVER-ONLY. The privileged writes (auth user, children, links,
  enrollments, grants) run on the ADMIN client AFTER this module's own
  validation: a VALID ACTIVE family invitation code is the authorization.
  Children are NEVER Supabase Auth users (product decision) — they are
  `children` rows linked to a parent and a class, and the registering DEVICE
  receives one raw child-device-grant token per child (hash-only in DB).
*/
import { cache } from "react";
import { assertServerOnly } from "../supabase/env";
import { getSupabaseAdminClient } from "../supabase/admin";
import { getRequestSupabase, getSessionUser, getCurrentUserProfile, requireTeacher } from "./auth";
import { consumeFamilyInvitation } from "./invitations";
import { createChildDeviceGrant } from "./childDeviceGrants";
import { BackendValidationError } from "./errors";
import type { Child } from "../supabase/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisteredChild {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  /** Raw device grant token — returned ONCE to the registering device. */
  grantToken: string;
}

export type RegisterFamilyResult =
  | { ok: true; children: RegisteredChild[]; createdAccount: boolean }
  | {
      ok: false;
      reason:
        | "invalid_code"
        | "invitation_unavailable"
        | "no_slots"
        | "invalid_input"
        | "email_exists"
        | "not_a_parent_session"
        | "server";
    };

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = getSupabaseAdminClient();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

/**
 * registerFamilyViaInvitation — the /join flow's single server entry point.
 *
 * Two modes:
 *  - NEW parent (no session): { parent: { displayName, email, password } } —
 *    creates the Auth user (email confirmed) + profiles(parent) + parent_profiles.
 *  - EXISTING parent session on this device: parent omitted — children are
 *    attached to the signed-in parent (their profile must be role=parent).
 *
 * In both modes (authorized by the ACTIVE invitation code, slots reserved
 * atomically): children rows + class_students(enrollment) + parent_child_links
 * + invitation_uses + ONE device grant per child for THIS device.
 */
export async function registerFamilyViaInvitation(input: {
  code: string;
  parent?: { displayName: string; email: string; password: string };
  children: Array<{ displayName: string; avatarUrl?: string | null }>;
}): Promise<RegisterFamilyResult> {
  assertServerOnly("registerFamilyViaInvitation");
  const admin = getSupabaseAdminClient();

  // ---- validate input shape ----
  const kids = (input.children ?? [])
    .map((c) => ({
      displayName: (c.displayName ?? "").trim().slice(0, 60),
      avatarUrl: c.avatarUrl ?? null,
    }))
    .filter((c) => c.displayName.length > 0);
  if (kids.length < 1 || kids.length > 10) return { ok: false, reason: "invalid_input" };

  // ---- resolve the parent (session or new account) ----
  let parentId: string;
  let createdAccount = false;
  if (input.parent) {
    const displayName = input.parent.displayName.trim().slice(0, 80);
    const email = input.parent.email.trim().toLowerCase();
    const password = input.parent.password;
    if (!displayName || !EMAIL_RE.test(email) || password.length < 8) {
      return { ok: false, reason: "invalid_input" };
    }
    const existing = await findAuthUserIdByEmail(email);
    if (existing) return { ok: false, reason: "email_exists" };

    // Reserve the slots BEFORE creating anything (atomic guard).
    const consumed = await consumeSafely(input.code, kids.length);
    if (!consumed.ok) return consumed;

    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (userErr || !created.user) {
      console.error("[families] createUser failed:", userErr?.message ?? "unknown");
      return { ok: false, reason: "server" };
    }
    parentId = created.user.id;
    createdAccount = true;
    const { error: profErr } = await admin
      .from("profiles")
      .upsert({ id: parentId, role: "parent", display_name: displayName }, { onConflict: "id" });
    if (profErr) throw new Error(`profiles upsert failed: ${profErr.message}`);
    const { error: ppErr } = await admin
      .from("parent_profiles")
      .upsert({ id: parentId }, { onConflict: "id" });
    if (ppErr) throw new Error(`parent_profiles upsert failed: ${ppErr.message}`);

    return finishRegistration(consumed.invitationId, consumed.classId, parentId, kids, createdAccount);
  }

  // Existing session mode
  const user = await getSessionUser();
  if (!user) return { ok: false, reason: "not_a_parent_session" };
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "parent") return { ok: false, reason: "not_a_parent_session" };
  const consumed = await consumeSafely(input.code, kids.length);
  if (!consumed.ok) return consumed;
  parentId = user.id;
  return finishRegistration(consumed.invitationId, consumed.classId, parentId, kids, false);
}

async function consumeSafely(
  code: string,
  childrenCount: number,
): Promise<{ ok: true; invitationId: string; classId: string } | RegisterFamilyResult & { ok: false }> {
  try {
    const { invitationId, classId } = await consumeFamilyInvitation({ code, childrenCount });
    return { ok: true, invitationId, classId };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (/not found/.test(msg)) return { ok: false, reason: "invalid_code" };
    if (/slots/.test(msg)) return { ok: false, reason: "no_slots" };
    if (/revoked|expired|concurrently/.test(msg)) return { ok: false, reason: "invitation_unavailable" };
    console.error("[families] consume failed:", msg);
    return { ok: false, reason: "server" };
  }
}

async function finishRegistration(
  invitationId: string,
  classId: string,
  parentId: string,
  kids: Array<{ displayName: string; avatarUrl: string | null }>,
  createdAccount: boolean,
): Promise<RegisterFamilyResult> {
  const admin = getSupabaseAdminClient();
  const out: RegisteredChild[] = [];
  for (const kid of kids) {
    const { data: child, error: childErr } = await admin
      .from("children")
      .insert({
        display_name: kid.displayName,
        avatar_url: kid.avatarUrl,
        created_by_role: "parent",
        via_invitation: true,
      })
      .select()
      .single();
    if (childErr || !child) throw new Error(`children insert failed: ${childErr?.message}`);

    const { error: enrollErr } = await admin
      .from("class_students")
      .insert({ class_id: classId, child_id: child.id });
    if (enrollErr) throw new Error(`class_students insert failed: ${enrollErr.message}`);

    const { error: linkErr } = await admin
      .from("parent_child_links")
      .insert({ parent_id: parentId, child_id: child.id });
    if (linkErr) throw new Error(`parent_child_links insert failed: ${linkErr.message}`);

    const { error: useErr } = await admin
      .from("invitation_uses")
      .insert({ invitation_id: invitationId, used_by_parent_id: parentId, child_id: child.id });
    if (useErr) throw new Error(`invitation_uses insert failed: ${useErr.message}`);

    // Device grant for THIS registering device (raw token returned once).
    const { rawToken } = await createChildDeviceGrant({
      childId: child.id,
      label: "جهاز التسجيل الأول",
      ttlDays: 90,
    });
    out.push({
      id: child.id,
      displayName: child.display_name,
      avatarUrl: child.avatar_url,
      grantToken: rawToken,
    });
  }
  return { ok: true, children: out, createdAccount };
}

/** The signed-in parent's linked children (RLS: own links + can_access_child). */
export const listChildrenForParent = cache(async (): Promise<Child[]> => {
  const supabase = await getRequestSupabase();
  const { data: links, error: linkErr } = await supabase
    .from("parent_child_links")
    .select("child_id")
    .eq("status", "active");
  if (linkErr) throw new Error(`parent_child_links read failed: ${linkErr.message}`);
  const ids = (links ?? []).map((l) => l.child_id);
  if (!ids.length) return [];
  const { data: children, error: childErr } = await supabase
    .from("children")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: true });
  if (childErr) throw new Error(`children read failed: ${childErr.message}`);
  return children ?? [];
});

/** Real registered children of the teacher's class(es) — RLS-scoped. */
export const listChildrenForTeacher = cache(async (): Promise<Child[]> => {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data: enrollments, error: enrErr } = await supabase
    .from("class_students")
    .select("child_id")
    .eq("status", "active")
    .limit(200);
  if (enrErr) throw new Error(`class_students read failed: ${enrErr.message}`);
  const ids = (enrollments ?? []).map((e) => e.child_id);
  if (!ids.length) return [];
  const { data: children, error: childErr } = await supabase
    .from("children")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: true });
  if (childErr) throw new Error(`children read failed: ${childErr.message}`);
  return children ?? [];
});

/** Guard against silly input in server actions. */
export function assertReasonableChildren(count: number): void {
  if (count < 1 || count > 10) throw new BackendValidationError("children count out of range");
}
