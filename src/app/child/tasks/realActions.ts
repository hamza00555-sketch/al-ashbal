"use server";

/* REAL recitation server actions for the CHILD DEVICE (Phase 3).
   Authorization is the device's raw grant token — validated server-side on
   every call (activeChildId is never trusted). Coarse, safe result codes. */
import { startRecordingUpload, finalizeSubmission, listSubmissionsForChildDevice } from "@/lib/backend/submissions";
import { latestOpenAssignmentForChild } from "@/lib/backend/assignments";
import type { Submission } from "@/lib/supabase/types";

function log(where: string, error: unknown) {
  console.error(
    `[real-recitation] ${where} failed:`,
    error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
  );
}

export async function getChildRecitationContext(input: {
  childId: string;
  grantToken: string;
}): Promise<
  | {
      ok: true;
      assignment: { id: string; title: string; points: number | null } | null;
      recent: Array<{ id: string; title: string; state: Submission["state"]; createdAt: string }>;
    }
  | { ok: false; reason: "invalid_grant" | "server" }
> {
  try {
    const [assignment, recent] = await Promise.all([
      latestOpenAssignmentForChild(input),
      listSubmissionsForChildDevice(input),
    ]);
    return {
      ok: true,
      assignment: assignment
        ? { id: assignment.id, title: assignment.title, points: assignment.points }
        : null,
      recent: recent.map((s) => ({
        id: s.id,
        title: s.title,
        state: s.state,
        createdAt: s.created_at,
      })),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (/grant/i.test(msg)) return { ok: false, reason: "invalid_grant" };
    log("context", error);
    return { ok: false, reason: "server" };
  }
}

export async function startRecitationUploadAction(input: {
  childId: string;
  grantToken: string;
  mimeType: string;
}): Promise<
  | { ok: true; path: string; uploadUrl: string; uploadToken: string }
  | { ok: false; reason: "invalid_grant" | "unsupported" | "server" }
> {
  try {
    const result = await startRecordingUpload(input);
    return { ok: true, ...result };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (/grant/i.test(msg)) return { ok: false, reason: "invalid_grant" };
    if (/unsupported/.test(msg)) return { ok: false, reason: "unsupported" };
    log("start", error);
    return { ok: false, reason: "server" };
  }
}

export async function finalizeRecitationAction(input: {
  childId: string;
  grantToken: string;
  path: string;
  mimeType: string;
  assignmentId?: string | null;
  durationSeconds?: number | null;
  title?: string;
}): Promise<
  | { ok: true; state: Submission["state"] }
  | { ok: false; reason: "invalid_grant" | "already_submitted" | "server" }
> {
  try {
    const { state } = await finalizeSubmission(input);
    return { ok: true, state };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (/grant/i.test(msg)) return { ok: false, reason: "invalid_grant" };
    if (/already submitted/.test(msg)) return { ok: false, reason: "already_submitted" };
    log("finalize", error);
    return { ok: false, reason: "server" };
  }
}
