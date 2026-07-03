"use server";

/*
  Server action for the PUBLIC join-request form (/join/request).
  Runs on the server only; the browser never sees the service role. The action
  returns coarse result codes — the form maps them to Arabic copy.
*/
import { submitJoinRequest, type SubmitJoinRequestResult } from "@/lib/backend/joinRequests";
import type { JoinRequestRole } from "@/lib/supabase/types";

export async function submitJoinRequestAction(input: {
  displayName: string;
  email: string;
  password: string;
  requestedRole: JoinRequestRole;
  note?: string;
}): Promise<SubmitJoinRequestResult> {
  try {
    return await submitJoinRequest(input);
  } catch (error) {
    // Safe server log only (no values beyond the error name/message).
    console.error(
      "[join-request] submit failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
    );
    return { ok: false, reason: "server" };
  }
}
