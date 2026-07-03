"use server";

/* Teacher family-invitation actions — Supabase-backed (Phase 2).
   All privileged work is server-side; creation/revocation run AS the teacher
   under RLS (creator-only policies). */
import { revalidatePath } from "next/cache";
import { createFamilyInvitation, revokeTeacherInvitation } from "@/lib/backend/invitations";
import type { Invitation } from "@/lib/supabase/types";

export type CreateInvitationResult =
  | { ok: true; invitation: Invitation }
  | { ok: false; message: string };

export async function createFamilyInvitationAction(input: {
  label?: string;
  maxChildren: number;
  expiresDays?: number;
}): Promise<CreateInvitationResult> {
  try {
    const invitation = await createFamilyInvitation(input);
    revalidatePath("/teacher/invitations");
    return { ok: true, invitation };
  } catch (error) {
    console.error(
      "[invitations] create failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
    );
    return { ok: false, message: "تعذّر إنشاء الدعوة. حاول مرة أخرى." };
  }
}

export async function revokeInvitationAction(
  invitationId: string,
): Promise<{ ok: boolean; message?: string }> {
  try {
    await revokeTeacherInvitation(invitationId);
    revalidatePath("/teacher/invitations");
    return { ok: true };
  } catch (error) {
    console.error(
      "[invitations] revoke failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
    );
    return { ok: false, message: "تعذّر إيقاف الدعوة. حدّث الصفحة وحاول مرة أخرى." };
  }
}
