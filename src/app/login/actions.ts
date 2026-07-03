"use server";

/*
  Post-login destination for the unified /login page.
  Runs on the server with the fresh auth cookies: reads the profile (RLS) and
  — when there is no role yet — the user's own join request, and returns where
  the UI should go / what it should say. No secrets, no privileged writes.
*/
import { getCurrentUserProfile } from "@/lib/backend/auth";
import { getOwnJoinRequest } from "@/lib/backend/joinRequests";

export type LoginDestination =
  | { kind: "teacher" } // approved teacher → /teacher
  | { kind: "parent" } // approved parent → /parent
  | { kind: "pending" } // join request under review
  | { kind: "rejected" } // join request rejected
  | { kind: "none" } // signed in but no profile and no request
  | { kind: "error" };

export async function resolveLoginDestination(): Promise<LoginDestination> {
  try {
    const profile = await getCurrentUserProfile();
    if (profile?.role === "teacher" || profile?.role === "admin") return { kind: "teacher" };
    if (profile?.role === "parent") return { kind: "parent" };
    const request = await getOwnJoinRequest().catch(() => null);
    if (request?.status === "pending") return { kind: "pending" };
    if (request?.status === "rejected") return { kind: "rejected" };
    return { kind: "none" };
  } catch (error) {
    console.error(
      "[login] destination resolution failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : "unknown",
    );
    return { kind: "error" };
  }
}
