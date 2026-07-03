/*
  Submissions + recordings — REAL implementation (Phase 3).

  ⚠️ SERVER-ONLY. Security model (C4 upload flow from the plan):
    - The recordings bucket is PRIVATE with NO client storage policies: the
      ONLY way in or out is a SERVER-minted signed URL (service role), issued
      after this module's own authorization.
    - The child device proves itself with its RAW grant token
      (validateChildDeviceGrant) — activeChildId is never trusted.
    - Storage paths are SERVER-GENERATED (<child_id>/<uuid>.<ext>); clients
      never choose paths, and finalize re-checks the path prefix belongs to
      the granted child.
    - Sibling safety: UNIQUE(child_id, assignment_id) in the DB; a re-submit
      is only allowed over an existing `rerecord` submission.
*/
import { randomUUID } from "node:crypto";
import { assertServerOnly, getRecordingsBucket } from "../supabase/env";
import { getSupabaseAdminClient } from "../supabase/admin";
import { getRequestSupabase, requireTeacher } from "./auth";
import { validateChildDeviceGrant } from "./childDeviceGrants";
import { BackendConflictError, BackendValidationError } from "./errors";
import type { RecordingKind, Submission } from "../supabase/types";

const MIME_TO_EXT: Record<string, { ext: string; kind: RecordingKind }> = {
  "audio/webm": { ext: "webm", kind: "audio" },
  "audio/mp4": { ext: "m4a", kind: "audio" },
  "audio/ogg": { ext: "ogg", kind: "audio" },
  "video/webm": { ext: "webm", kind: "video" },
  "video/mp4": { ext: "mp4", kind: "video" },
};

/** The child's active class (first active enrollment). */
async function classIdForChild(childId: string): Promise<string> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("class_students")
    .select("class_id")
    .eq("child_id", childId)
    .eq("status", "active")
    .limit(1);
  if (error) throw new Error(`class_students read failed: ${error.message}`);
  const classId = data?.[0]?.class_id;
  if (!classId) throw new BackendValidationError("child has no active class");
  return classId;
}

/** Does the child have a linked parent? (pending_parent vs pending_teacher) */
async function childHasParent(childId: string): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  const { count, error } = await admin
    .from("parent_child_links")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .eq("status", "active");
  if (error) throw new Error(`parent_child_links read failed: ${error.message}`);
  return (count ?? 0) > 0;
}

/**
 * startRecordingUpload — step 1 of the C4 flow.
 * Authorization: a VALID child device grant. Returns a server-generated path
 * and a one-time signed UPLOAD url for the private bucket.
 */
export async function startRecordingUpload(input: {
  childId: string;
  grantToken: string;
  mimeType: string;
}): Promise<{ path: string; uploadUrl: string; uploadToken: string }> {
  assertServerOnly("startRecordingUpload");
  const grant = await validateChildDeviceGrant({
    childId: input.childId,
    rawToken: input.grantToken,
  });
  const mime = MIME_TO_EXT[input.mimeType];
  if (!mime) throw new BackendValidationError("unsupported recording type");
  const path = `${grant.child_id}/${randomUUID()}.${mime.ext}`;
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(getRecordingsBucket())
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error(`signed upload failed: ${error?.message}`);
  return { path, uploadUrl: data.signedUrl, uploadToken: data.token };
}

/**
 * finalizeSubmission — step 2. Re-validates the grant, verifies the path
 * belongs to THAT child, and creates/updates the submission row.
 */
export async function finalizeSubmission(input: {
  childId: string;
  grantToken: string;
  path: string;
  mimeType: string;
  assignmentId?: string | null;
  durationSeconds?: number | null;
  title?: string;
}): Promise<{ submission: Submission; state: Submission["state"] }> {
  assertServerOnly("finalizeSubmission");
  const grant = await validateChildDeviceGrant({
    childId: input.childId,
    rawToken: input.grantToken,
  });
  if (!input.path.startsWith(`${grant.child_id}/`)) {
    throw new BackendValidationError("path does not belong to this child");
  }
  const mime = MIME_TO_EXT[input.mimeType];
  if (!mime) throw new BackendValidationError("unsupported recording type");

  const admin = getSupabaseAdminClient();
  const classId = await classIdForChild(grant.child_id);
  const hasParent = await childHasParent(grant.child_id);
  const state: Submission["state"] = hasParent ? "pending_parent" : "pending_teacher";
  const title = (input.title ?? "").trim().slice(0, 80) || "تسميع";

  const assignmentId = input.assignmentId ?? null;
  if (assignmentId) {
    const { data: existing, error: exErr } = await admin
      .from("submissions")
      .select("*")
      .eq("child_id", grant.child_id)
      .eq("assignment_id", assignmentId)
      .maybeSingle();
    if (exErr) throw new Error(`submissions read failed: ${exErr.message}`);
    if (existing) {
      if (existing.state !== "rerecord") {
        throw new BackendConflictError("already submitted for this assignment");
      }
      const { data: updated, error: updErr } = await admin
        .from("submissions")
        .update({
          recording_path: input.path,
          recording_type: mime.kind,
          duration_seconds: input.durationSeconds ?? null,
          state,
          note: null,
          submitted_via_grant_id: grant.id,
        })
        .eq("id", existing.id)
        .eq("state", "rerecord") // guard against a concurrent review
        .select()
        .single();
      if (updErr || !updated) throw new Error(`submission update failed: ${updErr?.message}`);
      return { submission: updated, state };
    }
  }

  const { data: created, error: insErr } = await admin
    .from("submissions")
    .insert({
      assignment_id: assignmentId,
      source_type: assignmentId ? "assignment" : "adhoc",
      class_id: classId,
      child_id: grant.child_id,
      submitted_via_grant_id: grant.id,
      title,
      recording_path: input.path,
      recording_type: mime.kind,
      duration_seconds: input.durationSeconds ?? null,
      state,
    })
    .select()
    .single();
  if (insErr || !created) {
    if (insErr?.code === "23505") {
      throw new BackendConflictError("already submitted for this assignment");
    }
    throw new Error(`submission insert failed: ${insErr?.message}`);
  }
  return { submission: created, state };
}

/** Signed PLAYBACK url — the RLS-scoped submission read IS the authorization
 *  (only the child's parent / the class teacher can see the row). 10 min. */
export async function getPlaybackUrl(submissionId: string): Promise<string | null> {
  assertServerOnly("getPlaybackUrl");
  const supabase = await getRequestSupabase();
  const { data: submission, error } = await supabase
    .from("submissions")
    .select("recording_path")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw new Error(`submission read failed: ${error.message}`);
  if (!submission?.recording_path) return null;
  const admin = getSupabaseAdminClient();
  const { data, error: signErr } = await admin.storage
    .from(getRecordingsBucket())
    .createSignedUrl(submission.recording_path, 600);
  if (signErr || !data) throw new Error(`signed url failed: ${signErr?.message}`);
  return data.signedUrl;
}

/** The signed-in PARENT's submissions for their children (RLS-scoped). */
export async function listSubmissionsForParent(): Promise<Submission[]> {
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`submissions read failed: ${error.message}`);
  return data ?? [];
}

/** The TEACHER's class submissions (RLS-scoped via can_access_child). */
export async function listSubmissionsForTeacher(): Promise<Submission[]> {
  await requireTeacher();
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`submissions read failed: ${error.message}`);
  return data ?? [];
}

/** The CHILD DEVICE's recent submissions (grant-validated, admin-read). */
export async function listSubmissionsForChildDevice(input: {
  childId: string;
  grantToken: string;
}): Promise<Submission[]> {
  assertServerOnly("listSubmissionsForChildDevice");
  const grant = await validateChildDeviceGrant({
    childId: input.childId,
    rawToken: input.grantToken,
  });
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .select("*")
    .eq("child_id", grant.child_id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(`submissions read failed: ${error.message}`);
  return data ?? [];
}
