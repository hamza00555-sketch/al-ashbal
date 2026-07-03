"use server";

/* Family registration server action (/join, Phase 2 — Supabase-backed).
   The ACTIVE invitation code is the authorization; all privileged writes are
   server-side. Returns raw device-grant tokens ONCE for this device. */
import {
  registerFamilyViaInvitation,
  type RegisterFamilyResult,
} from "@/lib/backend/families";
import { validateChildDeviceGrant } from "@/lib/backend/childDeviceGrants";

export async function registerFamilyAction(input: {
  code: string;
  parent?: { displayName: string; email: string; password: string };
  children: Array<{ displayName: string; avatarUrl?: string | null }>;
}): Promise<RegisterFamilyResult> {
  try {
    return await registerFamilyViaInvitation(input);
  } catch (error) {
    console.error(
      "[join] register failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
    );
    return { ok: false, reason: "server" };
  }
}

/** Server-side check that a device grant really authorizes a child (used by
 *  QA and future child actions — never trusts activeChildId). */
export async function verifyChildGrantAction(input: {
  childId: string;
  token: string;
}): Promise<{ valid: boolean }> {
  try {
    await validateChildDeviceGrant({ childId: input.childId, rawToken: input.token });
    return { valid: true };
  } catch {
    return { valid: false };
  }
}
