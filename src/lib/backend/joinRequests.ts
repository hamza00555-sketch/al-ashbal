/*
  Join requests — controlled onboarding (migration 011).
  ⚠️ SERVER-ONLY. All writes go through the ADMIN client (service role) after
  this module's own validation/authorization; join_requests has NO client write
  policies. Reads for the review page / own-status use the USER server client
  so RLS applies.
*/
import { getSupabaseAdminClient } from "../supabase/admin";
import { createSupabaseServerClient } from "../supabase/server";
import { assertServerOnly } from "../supabase/env";
import { requireTeacher } from "./auth";
import { BackendConflictError, BackendNotFoundError, BackendValidationError } from "./errors";
import type { JoinRequest, JoinRequestRole } from "../supabase/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmitJoinRequestResult =
  | { ok: true }
  | { ok: false; reason: "already_pending" | "already_member" | "invalid" | "server" };

/** Find an existing auth user id by email via the admin API (bootstrap scale). */
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
 * submitJoinRequest — PUBLIC path (anonymous visitor at /join/request).
 * Creates the auth user (no profiles row → authorizes NOTHING) + a pending
 * join_requests row. Approval later assigns the real role server-side.
 */
export async function submitJoinRequest(input: {
  displayName: string;
  email: string;
  password: string;
  requestedRole: JoinRequestRole;
  note?: string;
}): Promise<SubmitJoinRequestResult> {
  assertServerOnly("submitJoinRequest");
  const displayName = input.displayName.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase();
  const note = (input.note ?? "").trim().slice(0, 500) || null;
  const { password, requestedRole } = input;

  if (!displayName || !EMAIL_RE.test(email) || password.length < 8) {
    return { ok: false, reason: "invalid" };
  }
  if (requestedRole !== "teacher" && requestedRole !== "parent") {
    return { ok: false, reason: "invalid" };
  }

  const admin = getSupabaseAdminClient();

  // Existing PENDING request for this email → tell them it's under review.
  const { data: pending, error: pendingErr } = await admin
    .from("join_requests")
    .select("id")
    .eq("status", "pending")
    .ilike("email", email)
    .limit(1);
  if (pendingErr) throw new Error(`join_requests read failed: ${pendingErr.message}`);
  if (pending?.length) return { ok: false, reason: "already_pending" };

  // Create (or reuse) the auth user. NEVER change an existing user's password.
  let userId: string | null = null;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!createErr) {
    userId = created.user.id;
  } else if (/already|exists|registered/i.test(createErr.message)) {
    userId = await findAuthUserIdByEmail(email);
    if (userId) {
      // Already an active member (has a profile)? Then there is nothing to request.
      const { data: prof, error: profErr } = await admin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (profErr) throw new Error(`profiles read failed: ${profErr.message}`);
      if (prof) return { ok: false, reason: "already_member" };
    }
  } else {
    throw new Error(`createUser failed: ${createErr.message}`);
  }

  const { error: insertErr } = await admin.from("join_requests").insert({
    auth_user_id: userId,
    email,
    display_name: displayName,
    requested_role: requestedRole,
    note,
  });
  if (insertErr) {
    // unique partial index race → another pending request landed first
    if (insertErr.code === "23505") return { ok: false, reason: "already_pending" };
    throw new Error(`join_requests insert failed: ${insertErr.message}`);
  }
  return { ok: true };
}

/** The signed-in user's own latest join request (RLS: select_own). */
export async function getOwnJoinRequest(): Promise<JoinRequest | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("join_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`join_requests read failed: ${error.message}`);
  return data;
}

/** Count of PENDING requests (RLS: approved teachers) — dashboard info only. */
export async function countPendingJoinRequests(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("join_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw new Error(`join_requests count failed: ${error.message}`);
  return count ?? 0;
}

/** All requests for the review page (RLS: select_teacher — approved teachers). */
export async function listJoinRequests(): Promise<JoinRequest[]> {
  await requireTeacher();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("join_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`join_requests read failed: ${error.message}`);
  return data ?? [];
}

/** Attach a teacher to the default (oldest active) class — idempotent. */
async function attachTeacherToDefaultClass(teacherId: string): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { data: cls, error: clsErr } = await admin
    .from("classes")
    .select("id")
    .eq("archived", false)
    .order("created_at", { ascending: true })
    .limit(1);
  if (clsErr) throw new Error(`classes read failed: ${clsErr.message}`);
  const classId = cls?.[0]?.id;
  if (!classId) return; // no class seeded yet — approval still valid
  const { data: existing, error: exErr } = await admin
    .from("class_teachers")
    .select("id")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (exErr) throw new Error(`class_teachers read failed: ${exErr.message}`);
  if (existing) return;
  const { error } = await admin
    .from("class_teachers")
    .insert({ class_id: classId, teacher_id: teacherId });
  if (error) throw new Error(`class_teachers insert failed: ${error.message}`);
}

/**
 * approveJoinRequest — SERVER-ONLY, caller must be an approved teacher.
 * Assigns the requested role for real: profiles (+ teacher_profiles/class link
 * or parent_profiles) via the admin client, then marks the request approved.
 */
export async function approveJoinRequest(requestId: string): Promise<void> {
  assertServerOnly("approveJoinRequest");
  const { teacherId: reviewerId } = await requireTeacher();
  const admin = getSupabaseAdminClient();

  const { data: request, error: reqErr } = await admin
    .from("join_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (reqErr) throw new Error(`join_requests read failed: ${reqErr.message}`);
  if (!request) throw new BackendNotFoundError("join request not found");
  if (request.status !== "pending") {
    throw new BackendConflictError("join request already reviewed");
  }
  if (!request.auth_user_id) {
    throw new BackendValidationError("join request has no auth user to activate");
  }
  const userId = request.auth_user_id;

  // 1) profiles — assign the real role (idempotent)
  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      role: request.requested_role,
      display_name: request.display_name,
    },
    { onConflict: "id" },
  );
  if (profErr) throw new Error(`profiles upsert failed: ${profErr.message}`);

  // 2) role table + class link
  if (request.requested_role === "teacher") {
    const { error } = await admin
      .from("teacher_profiles")
      .upsert({ id: userId }, { onConflict: "id" });
    if (error) throw new Error(`teacher_profiles upsert failed: ${error.message}`);
    await attachTeacherToDefaultClass(userId);
  } else {
    const { error } = await admin
      .from("parent_profiles")
      .upsert({ id: userId }, { onConflict: "id" });
    if (error) throw new Error(`parent_profiles upsert failed: ${error.message}`);
    // No children are created or linked in this phase (family invitations later).
  }

  // 3) mark reviewed (guard on pending → no double-approve race)
  const { data: updated, error: updErr } = await admin
    .from("join_requests")
    .update({ status: "approved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id");
  if (updErr) throw new Error(`join_requests update failed: ${updErr.message}`);
  if (!updated?.length) throw new BackendConflictError("join request already reviewed");
}

/** rejectJoinRequest — SERVER-ONLY, caller must be an approved teacher. */
export async function rejectJoinRequest(requestId: string): Promise<void> {
  assertServerOnly("rejectJoinRequest");
  const { teacherId: reviewerId } = await requireTeacher();
  const admin = getSupabaseAdminClient();
  const { data: updated, error } = await admin
    .from("join_requests")
    .update({ status: "rejected", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id");
  if (error) throw new Error(`join_requests update failed: ${error.message}`);
  if (!updated?.length) throw new BackendConflictError("join request already reviewed");
}
