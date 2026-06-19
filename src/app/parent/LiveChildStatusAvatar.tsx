"use client";

import type { AvatarSize } from "@/components";
import type { ChildStatusLevel } from "@/lib/data";
import { useChildDisplayProfile } from "@/lib/demo/childProfiles";
import { ChildStatusAvatar } from "./ChildStatusAvatar";

/** Status-ringed child avatar reflecting the per-childId demo override. */
export function LiveChildStatusAvatar({
  childId,
  fallbackName,
  fallbackSrc,
  level,
  size = "lg",
}: {
  childId: string;
  fallbackName: string;
  fallbackSrc?: string;
  level: ChildStatusLevel;
  size?: AvatarSize;
}) {
  const p = useChildDisplayProfile(childId);
  return (
    <ChildStatusAvatar
      name={p.displayName || fallbackName}
      level={level}
      size={size}
      src={p.avatarUrl ?? fallbackSrc}
    />
  );
}
