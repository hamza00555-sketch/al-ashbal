/*
  Recordings upload flow (Phase 1b scaffolding — stubs; NOT wired). Phase 7 wires
  this. The C4 ordered flow keeps the submissions row and the Storage object in
  sync and prevents client-chosen paths.

  ⚠️ The recording_path is SERVER-GENERATED. The client never picks the path.
*/
import { NotImplementedBackendError } from "./errors";
import type { RecordingKind } from "../supabase/types";

/**
 * createRecordingUploadIntent — step 1 of the C4 flow.
 *   Caller: server action (parent for linked child, OR device via requireChildGrant).
 *   Auth:   is_parent_of_child OR a valid child device grant for childId.
 *   Input:  { childId, assignmentId, mime, sizeBytes, rawGrantToken? }.
 *   Output: { submissionId, recordingPath, signedUploadUrl }.
 *   Tables: submissions (insert state='uploading', server-generated path; enforces
 *           UNIQUE(child_id, assignment_id)). Storage: signed upload URL for the
 *           path only. Security: validate child access + MIME allow-list + size cap
 *           BEFORE issuing the URL; reject any client-supplied path.
 */
export async function createRecordingUploadIntent(input: {
  childId: string;
  assignmentId: string;
  mime: string;
  sizeBytes: number;
  rawGrantToken?: string;
}): Promise<{ submissionId: string; recordingPath: string; signedUploadUrl: string }> {
  throw new NotImplementedBackendError("createRecordingUploadIntent", { input });
}

/**
 * finalizeRecordingSubmission — step 2 of the C4 flow.
 *   Caller: server action (same authorization as the intent).
 *   Input:  { submissionId, recordingType, durationSeconds, rawGrantToken? }.
 *   Output: { state } — 'pending_parent' (or 'pending_teacher' if the child has no
 *           linked parent). Tables: submissions (verify object exists → update
 *           state + recording_type). Security: re-check authorization; a failed/
 *           missing upload leaves state='uploading' for the orphan-cleanup job.
 */
export async function finalizeRecordingSubmission(input: {
  submissionId: string;
  recordingType: RecordingKind;
  durationSeconds: number;
  rawGrantToken?: string;
}): Promise<{ state: "pending_parent" | "pending_teacher" }> {
  throw new NotImplementedBackendError("finalizeRecordingSubmission", { input });
}

/**
 * getSignedRecordingUrl — short-lived signed DOWNLOAD url for playback.
 *   Caller: server action. Auth: can_access_child(child) OR teacher of the class.
 *   Input: { submissionId }. Output: { url, expiresInSeconds }. Storage: signed
 *   url minted server-side; bucket is PRIVATE — never a public url.
 */
export async function getSignedRecordingUrl(input: {
  submissionId: string;
}): Promise<{ url: string; expiresInSeconds: number }> {
  throw new NotImplementedBackendError("getSignedRecordingUrl", { input });
}
