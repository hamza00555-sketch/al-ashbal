"use server";

/* REAL parent approval actions (Phase 3). The approval row inserts under the
   PARENT'S OWN RLS policy; only the state transition is admin-side behind a
   server authorization + state guard. */
import { revalidatePath } from "next/cache";
import { parentApproveSubmission, parentRequestRerecord } from "@/lib/backend/reviews";
import { getPlaybackUrl } from "@/lib/backend/submissions";

function log(where: string, error: unknown) {
  console.error(
    `[parent-approvals] ${where} failed:`,
    error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
  );
}

export async function approveSubmissionAction(
  submissionId: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await parentApproveSubmission(submissionId);
    revalidatePath("/parent");
    return { ok: true };
  } catch (error) {
    log("approve", error);
    return { ok: false, message: "تعذّر تنفيذ الموافقة. حدّث الصفحة وحاول مرة أخرى." };
  }
}

export async function rerecordSubmissionAction(
  submissionId: string,
  note?: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await parentRequestRerecord(submissionId, note);
    revalidatePath("/parent");
    return { ok: true };
  } catch (error) {
    log("rerecord", error);
    return { ok: false, message: "تعذّر تنفيذ الطلب. حدّث الصفحة وحاول مرة أخرى." };
  }
}

/** Signed playback URL (10 min) — the RLS-scoped row read is the authz. */
export async function playbackUrlAction(
  submissionId: string,
): Promise<{ ok: true; url: string } | { ok: false }> {
  try {
    const url = await getPlaybackUrl(submissionId);
    return url ? { ok: true, url } : { ok: false };
  } catch (error) {
    log("playback", error);
    return { ok: false };
  }
}
