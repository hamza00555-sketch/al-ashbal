"use client";

import { Avatar, type AvatarSize } from "../ui/Avatar";
import { ResponsiveNameText } from "../ui/ResponsiveNameText";
import { useProfileForRole } from "@/lib/auth/demoSession";
import type { Role } from "@/lib/auth/types";

/**
 * Role-reflected display name. Shows the role's saved demo override when set,
 * otherwise the page-provided fallback (seed name). Client-side so settings
 * edits reflect immediately on the role's home header. Uses Arabic-safe fitting.
 */
export function RoleName({ role, fallback }: { role: Role; fallback: string }) {
  const profile = useProfileForRole(role);
  return <ResponsiveNameText name={profile.displayName || fallback} />;
}

/** Role-reflected avatar (override avatar/name win over the page fallback). */
export function RoleAvatar({
  role,
  fallbackName,
  fallbackSrc,
  size = "hero",
}: {
  role: Role;
  fallbackName: string;
  fallbackSrc?: string;
  size?: AvatarSize;
}) {
  const profile = useProfileForRole(role);
  return (
    <Avatar
      name={profile.displayName || fallbackName}
      size={size}
      src={profile.avatarUrl ?? fallbackSrc}
    />
  );
}
