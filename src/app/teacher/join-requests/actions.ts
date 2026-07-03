"use server";

/*
  Review actions for /teacher/join-requests. Privileged writes happen ONLY here
  on the server: requireTeacher() inside the backend module, then the admin
  client assigns roles. The browser never touches the service role.
*/
import { revalidatePath } from "next/cache";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/backend/joinRequests";

export type ReviewActionResult = { ok: true } | { ok: false; message: string };

function safeMessage(error: unknown): string {
  console.error(
    "[join-requests] review action failed:",
    error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
  );
  return "تعذّر تنفيذ الإجراء. حدّث الصفحة وحاول مرة أخرى.";
}

export async function approveJoinRequestAction(requestId: string): Promise<ReviewActionResult> {
  try {
    await approveJoinRequest(requestId);
    revalidatePath("/teacher/join-requests");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: safeMessage(error) };
  }
}

export async function rejectJoinRequestAction(requestId: string): Promise<ReviewActionResult> {
  try {
    await rejectJoinRequest(requestId);
    revalidatePath("/teacher/join-requests");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: safeMessage(error) };
  }
}
