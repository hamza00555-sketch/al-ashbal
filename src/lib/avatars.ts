/*
  الأشبال — avatar asset helpers. Maps a child's gender to the matching 3D
  avatar PNG. Safe fallback to the boy avatar when gender is missing.
  No logic/state — usable from both server and client components.
*/
import type { ChildProfile } from "@/types";

/** Pick the child's 3D avatar by gender (fallback: boy). */
export function childAvatarSrc(gender?: ChildProfile["gender"]): string {
  return gender === "female"
    ? "/assets/avatars/avatar_child_girl_01.png"
    : "/assets/avatars/avatar_child_boy_01.png";
}
