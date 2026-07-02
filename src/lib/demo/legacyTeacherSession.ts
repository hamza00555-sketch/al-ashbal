/*
  Cleanup for the RETIRED local demo teacher gate (TCH-001/TCH-002 access codes).
  Phase 2 replaced it with real Supabase Auth; nothing reads this key anymore, so
  an old localStorage value can never authorize anyone. This helper just erases
  leftovers from devices that used the demo gate.
*/

const LEGACY_TEACHER_SESSION_KEY = "alashbal:demo-active-teacher-session";

/** Remove the retired demo teacher session from localStorage (browser only). */
export function clearLegacyTeacherSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_TEACHER_SESSION_KEY);
  } catch {
    // storage unavailable (private mode) — nothing to clean
  }
}
