"use client";

/*
  Teacher identity context (Phase 2 — real Supabase Auth).
  The SERVER layout resolves the signed-in teacher (profiles + teacher_profiles
  under RLS) and provides it here, so client components inside the dashboard
  (header name, identity strip, invitations) read ONE server-verified identity —
  never localStorage.
*/
import { createContext, useContext, type ReactNode } from "react";
import { ResponsiveNameText } from "@/components";

export interface TeacherIdentity {
  /** = auth.users.id = profiles.id (the real teacher uuid). */
  id: string;
  displayName: string;
}

const TeacherIdentityContext = createContext<TeacherIdentity | null>(null);

export function TeacherIdentityProvider({
  value,
  children,
}: {
  value: TeacherIdentity;
  children: ReactNode;
}) {
  return (
    <TeacherIdentityContext.Provider value={value}>
      {children}
    </TeacherIdentityContext.Provider>
  );
}

/** The signed-in teacher (server-verified). Null only outside the provider. */
export function useTeacherIdentity(): TeacherIdentity | null {
  return useContext(TeacherIdentityContext);
}

/** The teacher's display name for page headers (falls back to the seed name). */
export function TeacherName({ fallback }: { fallback: string }) {
  const teacher = useTeacherIdentity();
  return <ResponsiveNameText name={teacher?.displayName || fallback} />;
}
