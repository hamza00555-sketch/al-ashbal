"use client";

/*
  الأشبال — DEMO auth/profile session (Phase 2 shell).

  PURELY LOCAL: no backend, no Supabase, no real login. Holds the current demo
  role plus PER-ROLE profile overrides (display name / avatar) so each role can
  have its own demo identity. Stored in its OWN localStorage key so it never
  touches the other demo stores (materials/lessons/assignments/submissions/
  points/...).
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

export type ProfileOverride = Partial<Pick<Profile, "displayName" | "avatarUrl">>;
type Overrides = Partial<Record<Role, ProfileOverride>>;

/** Build a Profile from the existing seed user for a role (display-name/avatar). */
function baseProfileForRole(role: Role): Profile {
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
  overrides: Overrides;
}

const KEY = "alashbal:demo-session";
const EVENT = "alashbal:demo-session-changed";
const EMPTY_STORED: StoredSession = { role: DEFAULT_ROLE, overrides: {} };

function sanitizeOverride(o: unknown): ProfileOverride | undefined {
  if (!o || typeof o !== "object") return undefined;
  const { displayName, avatarUrl } = o as ProfileOverride;
  const out: ProfileOverride = {};
  if (typeof displayName === "string") out.displayName = displayName;
  if (typeof avatarUrl === "string") out.avatarUrl = avatarUrl;
  return Object.keys(out).length ? out : undefined;
}

function readStored(): StoredSession {
  if (typeof window === "undefined") return EMPTY_STORED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_STORED;
    const parsed = JSON.parse(raw) ?? {};
    const role: Role = DEMO_ROLES.includes(parsed.role) ? parsed.role : DEFAULT_ROLE;
    const overrides: Overrides = {};
    if (parsed.overrides && typeof parsed.overrides === "object") {
      for (const r of DEMO_ROLES) {
        const ov = sanitizeOverride(parsed.overrides[r]);
        if (ov) overrides[r] = ov;
      }
    }
    // Back-compat: an older single `profileOverride` belonged to `role`.
    const legacy = sanitizeOverride(parsed.profileOverride);
    if (legacy && !overrides[role]) overrides[role] = legacy;
    return { role, overrides };
  } catch {
    return EMPTY_STORED;
  }
}

function writeStored(next: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function resolveProfile(role: Role, overrides: Overrides): Profile {
  const base = baseProfileForRole(role);
  const ov = overrides[role];
  return ov ? { ...base, ...ov } : base;
}

// ---- imperative API --------------------------------------------------------

export function getCurrentRole(): Role {
  return readStored().role;
}
export function getCurrentProfile(): Profile {
  const s = readStored();
  return resolveProfile(s.role, s.overrides);
}
export function getProfileForRole(role: Role): Profile {
  return resolveProfile(role, readStored().overrides);
}
export function getRoleOverride(role: Role): ProfileOverride {
  return readStored().overrides[role] ?? {};
}

/** Switch the demo role (testing only) — keeps each role's saved override. */
export function setDemoRole(role: Role) {
  if (!DEMO_ROLES.includes(role)) return;
  const cur = readStored();
  writeStored({ ...cur, role });
}

/** Apply an override for a SPECIFIC role (independent of other roles). */
export function setRoleOverride(role: Role, patch: ProfileOverride) {
  const cur = readStored();
  const next: ProfileOverride = { ...cur.overrides[role], ...patch };
  writeStored({ ...cur, overrides: { ...cur.overrides, [role]: next } });
}

/** Reset ONLY this role back to its seed default (other roles untouched). */
export function resetRoleOverride(role: Role) {
  const cur = readStored();
  const nextOverrides = { ...cur.overrides };
  delete nextOverrides[role];
  writeStored({ ...cur, overrides: nextOverrides });
}

/** Demo reset: clears the WHOLE demo session (all roles). */
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
  const cache = useRef<{ sig: string; value: StoredSession }>({ sig: "∅", value: EMPTY_STORED });
  const getSnapshot = useCallback((): StoredSession => {
    const s = readStored();
    const sig = JSON.stringify(s);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: s };
    return s;
  }, []);
  const getServerSnapshot = useCallback((): StoredSession => EMPTY_STORED, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCurrentRole(): Role {
  return useStored().role;
}

export function useCurrentProfile(): Profile {
  const s = useStored();
  return useMemo(() => resolveProfile(s.role, s.overrides), [s]);
}

/** Resolved profile for a specific role (reacts to that role's override). */
export function useProfileForRole(role: Role): Profile {
  const s = useStored();
  return useMemo(() => resolveProfile(role, s.overrides), [role, s]);
}

export function useAuthSession(): AuthSession {
  const profile = useCurrentProfile();
  return { profile, isDemo: true };
}
