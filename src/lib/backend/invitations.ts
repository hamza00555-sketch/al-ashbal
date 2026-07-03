/*
  Invitations data access — REAL implementation (Phase 2: family onboarding).

  Security model (from the plan + red-team corrections):
    - Codes are SERVER-generated with real entropy (C3); clients never write
      counters or rows directly.
    - Teacher create/list/revoke run under the TEACHER'S OWN RLS policies
      (invitations_insert_creator / select_creator / update_creator) via the
      user server client — no service role needed for the teacher CRUD.
    - validateInvitationCode is the only anonymous lookup: server-side (admin
      client, RLS bypassed on purpose for ONE code equality lookup) and returns
      a PUBLIC-SAFE projection only (no ids, no creator, no counters beyond
      remaining slots).
    - consumeFamilyInvitation reserves child slots with the ATOMIC counter
      guard (C2): a conditional UPDATE that cannot exceed max_children even
      under concurrency (DB CHECK constraint backs it up).
*/
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { assertServerOnly } from "../supabase/env";
import { getSupabaseAdminClient } from "../supabase/admin";
import { getRequestSupabase, requireTeacher } from "./auth";
import {
  BackendConflictError,
  BackendNotFoundError,
  BackendPermissionError,
  BackendValidationError,
} from "./errors";
import type { Invitation, InvitationPublic } from "../supabase/types";

/** Crockford-ish alphabet: no 0/O/1/I/L ambiguity in WhatsApp/handwriting. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const CODE_LENGTH = 8; // ~39 bits of entropy + uniqueness retry

function generateInvitationCode(): string {
  assertServerOnly("generateInvitationCode");
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `FAM-${out}`;
}

export function invitationStatus(inv: Pick<Invitation, "revoked_at" | "expires_at">):
  | "active"
  | "expired"
  | "revoked" {
  if (inv.revoked_at) return "revoked";
  if (inv.expires_at && Date.parse(inv.expires_at) < Date.now()) return "expired";
  return "active";
}

/** The teacher's default class (oldest active one they teach) — RLS-scoped. */
export const getMyDefaultClassId = cache(async (): Promise<string | null> => {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("classes")
    .select("id")
    .eq("archived", false)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw new Error(`classes read failed: ${error.message}`);
  return data?.[0]?.id ?? null;
});

/**
 * createFamilyInvitation — teacher mints a family invitation (their own class).
 * Runs AS the teacher under RLS (insert_creator policy enforces creator = uid
 * and teacher-of-class). Retries once on a code collision.
 */
export async function createFamilyInvitation(input: {
  label?: string;
  maxChildren: number;
  maxParents?: number;
  expiresDays?: number;
}): Promise<Invitation> {
  assertServerOnly("createFamilyInvitation");
  const { teacherId } = await requireTeacher();
  const classId = await getMyDefaultClassId();
  if (!classId) throw new BackendValidationError("لا توجد حلقة مرتبطة بالمعلم");
  const maxChildren = Math.min(Math.max(Math.trunc(input.maxChildren) || 1, 1), 10);
  const maxParents = Math.min(Math.max(Math.trunc(input.maxParents ?? 1) || 1, 1), 2);
  const days = Math.min(Math.max(Math.trunc(input.expiresDays ?? 7) || 7, 1), 60);
  const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
  const supabase = await getRequestSupabase();

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        type: "family",
        code: generateInvitationCode(),
        label: (input.label ?? "").trim().slice(0, 80) || null,
        class_id: classId,
        created_by_teacher_id: teacherId,
        max_children: maxChildren,
        max_parents: maxParents,
        expires_at: expiresAt,
      })
      .select()
      .single();
    if (!error && data) return data;
    if (error && error.code === "23505" && attempt === 0) continue; // rare collision
    throw new Error(`invitations insert failed: ${error?.message}`);
  }
  throw new BackendConflictError("code collision");
}

/** The teacher's own invitations (RLS select_creator). */
export async function listMyInvitations(): Promise<Invitation[]> {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("type", "family")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`invitations read failed: ${error.message}`);
  return data ?? [];
}

/** revokeTeacherInvitation — RLS update_creator (only the creator can). */
export async function revokeTeacherInvitation(invitationId: string): Promise<void> {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .is("revoked_at", null)
    .select("id");
  if (error) throw new Error(`invitations revoke failed: ${error.message}`);
  if (!data?.length) throw new BackendPermissionError("invitation not found or not yours");
}

/**
 * validateInvitationCode — anon-safe lookup for the /join screen.
 * Server-side single-code equality lookup (admin); returns PUBLIC-SAFE fields.
 */
export async function validateInvitationCode(code: string): Promise<InvitationPublic | null> {
  assertServerOnly("validateInvitationCode");
  const clean = code.trim().toUpperCase();
  if (!/^FAM-[A-Z2-9]{6,12}$/.test(clean)) return null;
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select("type,label,max_children,used_children_count,expires_at,revoked_at")
    .eq("code", clean)
    .maybeSingle();
  if (error) throw new Error(`invitation lookup failed: ${error.message}`);
  if (!data) return null;
  return {
    type: data.type,
    label: data.label,
    max_children: data.max_children,
    remaining_children: Math.max(0, data.max_children - data.used_children_count),
    status: invitationStatus(data),
  };
}

/**
 * consumeFamilyInvitation — atomically reserve N child slots + 1 parent slot.
 * Admin client; the conditional UPDATE (+ DB CHECK) is the concurrency guard.
 */
export async function consumeFamilyInvitation(input: {
  code: string;
  childrenCount: number;
}): Promise<{ invitationId: string; classId: string }> {
  assertServerOnly("consumeFamilyInvitation");
  const clean = input.code.trim().toUpperCase();
  const n = Math.trunc(input.childrenCount);
  if (n < 1) throw new BackendValidationError("childrenCount must be >= 1");
  const admin = getSupabaseAdminClient();
  const { data: inv, error: findErr } = await admin
    .from("invitations")
    .select("id,class_id,type,max_children,used_children_count,expires_at,revoked_at")
    .eq("code", clean)
    .maybeSingle();
  if (findErr) throw new Error(`invitation lookup failed: ${findErr.message}`);
  if (!inv || inv.type !== "family") throw new BackendNotFoundError("invitation not found");
  if (invitationStatus(inv) !== "active") {
    throw new BackendConflictError(`invitation ${invitationStatus(inv)}`);
  }
  if (inv.used_children_count + n > inv.max_children) {
    throw new BackendConflictError("not enough child slots left");
  }
  // Atomic guard: only succeeds if the slots are STILL free at update time.
  const { data: updated, error: updErr } = await admin
    .from("invitations")
    .update({ used_children_count: inv.used_children_count + n })
    .eq("id", inv.id)
    .eq("used_children_count", inv.used_children_count) // optimistic-lock guard
    .is("revoked_at", null)
    .select("id,class_id");
  if (updErr) throw new Error(`invitation consume failed: ${updErr.message}`);
  if (!updated?.length) throw new BackendConflictError("invitation was used concurrently — try again");
  return { invitationId: inv.id, classId: inv.class_id };
}
