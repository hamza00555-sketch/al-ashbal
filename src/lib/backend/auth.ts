/*
  Auth/session data access (Phase 1b scaffolding — stubs; NOT wired).
  ⚠️ Server-side: use createSupabaseServerClient() (user session) in later phases.
*/
import { NotImplementedBackendError } from "./errors";
import type { Profile, TeacherProfile } from "../supabase/types";

/**
 * getCurrentUserProfile — the signed-in user's profile.
 *   Caller: server. Auth: requires a Supabase session. Input: none.
 *   Output: Profile | null. Tables: profiles (select own via RLS). Security:
 *   RLS `id = auth.uid()`.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  throw new NotImplementedBackendError("getCurrentUserProfile");
}

/**
 * getCurrentTeacherProfile — profile + teacher_profile for the signed-in teacher.
 *   Caller: server. Auth: session with role='teacher'. Output: combined or null.
 *   Tables: profiles, teacher_profiles. Security: own rows via RLS.
 */
export async function getCurrentTeacherProfile(): Promise<
  (Profile & TeacherProfile) | null
> {
  throw new NotImplementedBackendError("getCurrentTeacherProfile");
}

/**
 * requireTeacher — assert the caller is an authenticated teacher; return their id.
 *   Caller: top of every teacher server action. Throws BackendAuthError /
 *   BackendPermissionError otherwise. Security: never trust a client-sent role.
 */
export async function requireTeacher(): Promise<{ teacherId: string }> {
  throw new NotImplementedBackendError("requireTeacher");
}
