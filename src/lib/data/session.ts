/*
  Mock session helpers (demo phase only — replaced by real auth later).
  Returns a representative user per role so the UI and permission tests have a
  concrete "current viewer".
*/
import type { User, UserRole } from "@/types";
import { users } from "./users";

const SAMPLE_BY_ROLE: Record<UserRole, string> = {
  child: "u-c1", // عبدالله, linked to parent u-p1, halaqa h1
  parent: "u-p1", // father of ch1 & ch2
  teacher: "u-t1", // teaches halaqa h1
  guest: "u-g1",
  admin: "u-a1",
};

export function getMockUser(role: UserRole): User {
  const id = SAMPLE_BY_ROLE[role];
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error(`No mock user for role: ${role}`);
  return user;
}

export function getUserById(id: string): User | null {
  return users.find((u) => u.id === id) ?? null;
}
