/*
  الأشبال — Auth/Profile shell types (Phase 2, demo-safe).

  These are the forward-looking shapes for the future backend (Supabase
  profiles). For now they back a LOCAL demo session only — no real auth, no
  backend, no Supabase. Aligned with docs/PRODUCTION_DATA_MODEL_SCHEMA.md
  (profiles table) and docs/AUTH_PROFILES_PHASE2_SCOPE.md.
*/
import type { UserRole } from "@/types";

/** Role re-exported for auth-layer consumers (same union as the app's UserRole). */
export type Role = UserRole; // "child" | "parent" | "teacher" | "guest" | "admin"

/** A user profile (maps to the future `profiles` table). */
export interface Profile {
  id: string;
  role: Role;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The current session. `isDemo` is always true in this phase — there is no
 * real authentication yet; the profile comes from the local demo session.
 */
export interface AuthSession {
  profile: Profile | null;
  isDemo: boolean;
}

/** Convenience alias for the resolved current profile (or null if none). */
export type CurrentUserProfile = Profile | null;
