"use client";

/*
  الأشبال — LOCAL DEMO teacher access gate (no backend, no real auth).

  This is NOT secure authentication. It only gates the /teacher area behind a
  seeded access code while the app is a localStorage demo. The codes below are
  hard-coded for the demo and intentionally NOT shown on the login screen.

  PRODUCTION MUST REPLACE THIS with real backend auth + server-side route
  protection (sessions/cookies, signed tokens, etc.). Do not ship this gate.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export interface DemoTeacherSession {
  teacherId: string;
  displayName: string;
  accessCode: string;
  loggedInAt: string;
}

interface DemoTeacherCode {
  code: string;
  teacherId: string;
  displayName: string;
}

// LOCAL DEMO access codes (dev/test only — TCH-001, TCH-002). Not real auth.
export const DEMO_TEACHER_ACCESS_CODES: DemoTeacherCode[] = [
  { code: "TCH-001", teacherId: "teacher-001", displayName: "المعلم الأول" },
  { code: "TCH-002", teacherId: "teacher-002", displayName: "المعلم الثاني" },
];

const KEY = "alashbal:demo-active-teacher-session";
const EVENT = "alashbal:demo-active-teacher-session-changed";

function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function read(): DemoTeacherSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && typeof parsed.teacherId === "string") {
      return parsed as DemoTeacherSession;
    }
    return null;
  } catch {
    return null;
  }
}

function write(session: DemoTeacherSession | null) {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getActiveTeacherSession(): DemoTeacherSession | null {
  return read();
}
export function setActiveTeacherSession(session: DemoTeacherSession) {
  write(session);
}
export function clearActiveTeacherSession() {
  write(null);
}
export function isTeacherLoggedIn(): boolean {
  return read() !== null;
}

/** Resolve a seeded demo access code (case/space-insensitive), or null. */
export function findTeacherByCode(code: string): DemoTeacherCode | null {
  const wanted = normalize(code);
  if (!wanted) return null;
  return DEMO_TEACHER_ACCESS_CODES.find((t) => normalize(t.code) === wanted) ?? null;
}

// ---- reactive hook ---------------------------------------------------------

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Reactive teacher session (SSR-safe: server snapshot is null). The snapshot is
 *  cached by signature so useSyncExternalStore gets a STABLE reference when the
 *  session is unchanged (read() parses a fresh object each call otherwise). */
export function useTeacherSession(): DemoTeacherSession | null {
  const cache = useRef<{ sig: string; value: DemoTeacherSession | null }>({ sig: "∅", value: null });
  const getSnapshot = useCallback((): DemoTeacherSession | null => {
    const value = read();
    const sig = JSON.stringify(value);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value };
    return cache.current.value;
  }, []);
  const getServer = useCallback(() => null, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServer);
}
