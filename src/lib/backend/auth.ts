/*
  Auth/session data access — REQUEST-SCOPED CACHED (perf task N2).
  ⚠️ Server-only. React cache() dedupes the expensive reads inside ONE server
  render/action pass: no matter how many layers ask (layout → page →
  requireTeacher), the request performs at most ONE auth/v1/user call and ONE
  profiles read. Security is unchanged: the values still come from Supabase
  under RLS on every request — never from the client, never across requests.
*/
import { cache } from "react";
import { createSupabaseServerClient } from "../supabase/server";
import { BackendAuthError, BackendPermissionError } from "./errors";
import type { Profile, TeacherProfile } from "../supabase/types";

/** One server client per request (cookie-bound; creation is cheap but this
 *  also guarantees every helper shares the same session view). */
export const getRequestSupabase = cache(async () => createSupabaseServerClient());

/** One VERIFIED auth user per request (single /auth/v1/user round trip). */
const getRequestUser = cache(async () => {
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null; // fail closed: unverified → signed out
  return data.user;
});

/** One profiles read per request (RLS: `id = auth.uid()`). */
const getRequestProfile = cache(async (): Promise<Profile | null> => {
  const user = await getRequestUser();
  if (!user) return null;
  const supabase = await getRequestSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`[backend/auth] profiles read failed: ${error.message}`);
  return data;
});

/** Does the request carry a verified session? (cached — no extra round trip) */
export async function getSessionUser() {
  return getRequestUser();
}

/**
 * getCurrentUserProfile — the signed-in user's profile (cached per request).
 *   Output: Profile | null (null when signed out OR no profiles row yet).
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  return getRequestProfile();
}

/**
 * getCurrentTeacherProfile — profile + teacher_profiles for the signed-in
 * teacher (cached per request). Role comes from the SERVER-read profile.
 */
export const getCurrentTeacherProfile = cache(
  async (): Promise<(Profile & TeacherProfile) | null> => {
    const profile = await getRequestProfile();
    if (!profile || profile.role !== "teacher") return null;
    const supabase = await getRequestSupabase();
    const { data: teacher, error } = await supabase
      .from("teacher_profiles")
      .select("*")
      .eq("id", profile.id)
      .maybeSingle();
    if (error) {
      throw new Error(`[backend/auth] teacher_profiles read failed: ${error.message}`);
    }
    // A teacher-role profile without its teacher_profiles row (half-bootstrapped)
    // still counts as a teacher; bio is simply empty.
    return {
      ...profile,
      bio: teacher?.bio ?? null,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  },
);

/**
 * requireTeacher — assert the caller is an authenticated teacher; return their
 * id. Throws BackendAuthError (signed out) / BackendPermissionError (wrong
 * role). Benefits from the request cache: inside a render pass that already
 * resolved the user/profile (the teacher layout), this adds ZERO round trips.
 */
export async function requireTeacher(): Promise<{ teacherId: string }> {
  const user = await getRequestUser();
  if (!user) throw new BackendAuthError("requireTeacher: no session");
  const profile = await getRequestProfile();
  if (!profile || profile.role !== "teacher") {
    throw new BackendPermissionError("requireTeacher: signed-in user is not a teacher");
  }
  return { teacherId: user.id };
}
