"use client";

/*
  الأشبال — DEMO auth/profile session (Phase 2 shell).

  PURELY LOCAL: no backend, no Supabase, no real login. It holds a "current
  profile" + role so the app can read who the current user is via hooks, and
  lets us switch the demo role for testing. Stored in its OWN localStorage key
  so it never touches the existing demo stores (materials/lessons/assignments/
  submissions/points/...). Acts as the single source (provider) for the current
  profile until real auth replaces it later.
*/
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import type { UserRole } from "@/types";
import { getMockUser } from "@/lib/data";
import type { AuthSession, Profile, Role } from "./types";

export const DEMO_ROLES: Role[] = ["teacher", "parent", "child", "guest", "admin"];

export const ROLE_LABEL: Record<Role, string> = {
  child: "طفل",
  parent: "ولي أمر",
  teacher: "معلم",
  guest: "ضيف",
  admin: "مشرف",
};

/** Default role for the demo session (control center). */
const DEFAULT_ROLE: Role = "teacher";

/** Build a Profile from the existing seed user for a role (display-name/avatar). */
function profileForRole(role: Role): Profile {
  const u = getMockUser(role as UserRole);
  return {
    id: u.id,
    role: u.role,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

interface StoredSession {
  role: Role;
  /** Optional overrides on top of the role's default profile (demo edits). */
  profileOverride?: Partial<Pick<Profile, "displayName" | "avatarUrl">>;
}

const KEY = "alashbal:demo-session";
const EVENT = "alashbal:demo-session-changed";

function readStored(): StoredSession {
  if (typeof window === "undefined") return { role: DEFAULT_ROLE };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { role: DEFAULT_ROLE };
    const parsed = JSON.parse(raw);
    const role: Role = DEMO_ROLES.includes(parsed?.role) ? parsed.role : DEFAULT_ROLE;
    return { role, profileOverride: parsed?.profileOverride };
  } catch {
    return { role: DEFAULT_ROLE };
  }
}

function writeStored(next: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function resolveProfile(s: StoredSession): Profile {
  const base = profileForRole(s.role);
  return s.profileOverride ? { ...base, ...s.profileOverride } : base;
}

// ---- imperative API --------------------------------------------------------

export function getCurrentRole(): Role {
  return readStored().role;
}
export function getCurrentProfile(): Profile {
  return resolveProfile(readStored());
}

/** Switch the demo role (testing only). */
export function setDemoRole(role: Role) {
  if (!DEMO_ROLES.includes(role)) return;
  // changing role drops any previous per-role override
  writeStored({ role });
}

/** Apply a small profile override (e.g. display name) for the current role. */
export function setDemoProfile(patch: Partial<Pick<Profile, "displayName" | "avatarUrl">>) {
  const cur = readStored();
  writeStored({ ...cur, profileOverride: { ...cur.profileOverride, ...patch } });
}

/** Demo reset: clears ONLY the demo session (never the other demo stores). */
export function resetDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

// ---- reactive hooks --------------------------------------------------------

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function useStored(): StoredSession {
  const cache = useRef<{ sig: string; value: StoredSession }>({ sig: "∅", value: { role: DEFAULT_ROLE } });
  const getSnapshot = useCallback((): StoredSession => {
    const s = readStored();
    const sig = JSON.stringify(s);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: s };
    return s;
  }, []);
  // SSR/first-paint use the default role (stable) to avoid hydration mismatch.
  const getServerSnapshot = useCallback((): StoredSession => ({ role: DEFAULT_ROLE }), []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCurrentRole(): Role {
  return useStored().role;
}

export function useCurrentProfile(): Profile {
  const s = useStored();
  // `s` is referentially stable per content (cached in useStored), so memo is safe.
  return useMemo(() => resolveProfile(s), [s]);
}

export function useAuthSession(): AuthSession {
  const profile = useCurrentProfile();
  return { profile, isDemo: true };
}
