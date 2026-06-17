/*
  الأشبال — avatar asset helpers. Maps a child's gender to the matching 3D
  avatar PNG. Safe fallback to the boy avatar when gender is missing.
  No logic/state — usable from both server and client components.
*/
import type { ChildProfile } from "@/types";
import { childProfiles } from "@/lib/data/children";

/** Pick the child's 3D avatar by gender (fallback: boy). */
export function childAvatarSrc(gender?: ChildProfile["gender"]): string {
  return gender === "female"
    ? "/assets/avatars/avatar_child_girl_01.png"
    : "/assets/avatars/avatar_child_boy_01.png";
}

/** Resolve a child's 3D avatar by id (client-safe: reads static mock profiles,
 *  no viewer gating — gender is not private). Falls back to the boy avatar. */
export function childAvatarById(childId: string): string {
  const child = childProfiles.find((c) => c.id === childId);
  return childAvatarSrc(child?.gender);
}
