"use client";

import { Avatar, type AvatarSize } from "../ui/Avatar";
import { useChildDisplayProfile } from "@/lib/demo/childProfiles";

/** Child display name reflecting the per-childId demo override (else fallback). */
export function ChildDisplayName({ childId, fallback }: { childId: string; fallback: string }) {
  const p = useChildDisplayProfile(childId);
  return <>{p.displayName || fallback}</>;
}

/** Child avatar reflecting the per-childId override (override wins over fallback). */
export function ChildDisplayAvatar({
  childId,
  fallbackName,
  fallbackSrc,
  size = "hero",
}: {
  childId: string;
  fallbackName: string;
  fallbackSrc?: string;
  size?: AvatarSize;
}) {
  const p = useChildDisplayProfile(childId);
  return <Avatar name={p.displayName || fallbackName} size={size} src={p.avatarUrl ?? fallbackSrc} />;
}
