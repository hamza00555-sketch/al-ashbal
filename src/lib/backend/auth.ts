/*
  Auth/session data access (Phase 2 — REAL implementation, wired to Supabase).
  ⚠️ Server-only: every function here builds a request-scoped server client
  (cookies + anon key), so RLS applies as the signed-in user.
*/
import { createSupabaseServerClient } from "../supabase/server";
import { BackendAuthError, BackendPermissionError } from "./errors";
import type { Profile, TeacherProfile } from "../supabase/types";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** The signed-in auth user's id, or null (no session / expired session). */
async function getSessionUserId(supabase: ServerClient): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null; // fail closed: no verified user → signed out
  return data.user.id;
}

/** The user's own `profiles` row (RLS: `id = auth.uid()`), or null if absent. */
async function readOwnProfile(
  supabase: ServerClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(`[backend/auth] profiles read failed: ${error.message}`);
  return data;
}

/**
 * getCurrentUserProfile — the signed-in user's profile.
 *   Caller: server. Auth: requires a Supabase session. Input: none.
 *   Output: Profile | null (null when signed out OR the auth user has no
 *   profiles row yet). Tables: profiles (select own via RLS `id = auth.uid()`).
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const userId = await getSessionUserId(supabase);
  if (!userId) return null;
  return readOwnProfile(supabase, userId);
}

/**
 * getCurrentTeacherProfile — profile + teacher_profile for the signed-in teacher.
 *   Caller: server. Output: combined row, or null when signed out / not a
 *   teacher. The role check is on the SERVER-read profiles row — never a
 *   client-sent value. Tables: profiles, teacher_profiles (own rows via RLS).
 */
export async function getCurrentTeacherProfile(): Promise<
  (Profile & TeacherProfile) | null
> {
  const supabase = await createSupabaseServerClient();
  const userId = await getSessionUserId(supabase);
  if (!userId) return null;
  const profile = await readOwnProfile(supabase, userId);
  if (!profile || profile.role !== "teacher") return null;
  const { data: teacher, error } = await supabase
    .from("teacher_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`[backend/auth] teacher_profiles read failed: ${error.message}`);
  }
  // A teacher-role profile without its teacher_profiles row (half-bootstrapped)
  // still counts as a teacher; bio is simply empty.
  return {
    ...profile,
    bio: teacher?.bio ?? null,
  };
}

/**
 * requireTeacher — assert the caller is an authenticated teacher; return their id.
 *   Caller: top of every teacher server action. Throws BackendAuthError when
 *   signed out, BackendPermissionError when signed in without the teacher role.
 */
export async function requireTeacher(): Promise<{ teacherId: string }> {
  const supabase = await createSupabaseServerClient();
  const userId = await getSessionUserId(supabase);
  if (!userId) throw new BackendAuthError("requireTeacher: no session");
  const profile = await readOwnProfile(supabase, userId);
  if (!profile || profile.role !== "teacher") {
    throw new BackendPermissionError("requireTeacher: signed-in user is not a teacher");
  }
  return { teacherId: userId };
}
