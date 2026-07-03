"use server";

/* REAL teacher review actions (Phase 3). Review + points insert under the
   TEACHER'S OWN RLS policies; only the submission state transition is
   admin-side behind requireTeacher + a state guard. */
import { revalidatePath } from "next/cache";
import { teacherAcceptSubmission, teacherRequestRerecord } from "@/lib/backend/reviews";
import { getPlaybackUrl } from "@/lib/backend/submissions";
import { createRecitationAssignment } from "@/lib/backend/assignments";

function log(where: string, error: unknown) {
  console.error(
    `[teacher-reviews] ${where} failed:`,
    error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
  );
}

export async function acceptSubmissionAction(input: {
  submissionId: string;
  points: number;
  note?: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await teacherAcceptSubmission(input);
    revalidatePath("/teacher/reviews");
    return { ok: true };
  } catch (error) {
    log("accept", error);
    return { ok: false, message: "تعذّر قبول التسميع. حدّث الصفحة وحاول مرة أخرى." };
  }
}

export async function rerecordSubmissionAction(input: {
  submissionId: string;
  note?: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await teacherRequestRerecord(input);
    revalidatePath("/teacher/reviews");
    return { ok: true };
  } catch (error) {
    log("rerecord", error);
    return { ok: false, message: "تعذّر تنفيذ الطلب. حدّث الصفحة وحاول مرة أخرى." };
  }
}

export async function teacherPlaybackUrlAction(
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

export async function createAssignmentAction(input: {
  title: string;
  points?: number | null;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    await createRecitationAssignment(input);
    revalidatePath("/teacher/reviews");
    return { ok: true };
  } catch (error) {
    log("create-assignment", error);
    return { ok: false, message: "تعذّر إنشاء المهمة. حاول مرة أخرى." };
  }
}
