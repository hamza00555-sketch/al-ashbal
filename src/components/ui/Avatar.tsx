import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { AssetImage } from "./AssetImage";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-9 text-caption",
  md: "size-11 text-body",
  lg: "size-14 text-card-title",
  xl: "size-20 text-h2",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  return parts
    .slice(0, 2)
    .map((p) => Array.from(p)[0])
    .join("");
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: AvatarSize;
  /** Optional avatar image (e.g. /assets/avatars/avatar_child_boy_01.png).
   *  Falls back to the initials circle if missing — so it never breaks. */
  src?: string;
}

const ringClasses =
  "inline-flex select-none items-center justify-center overflow-hidden rounded-pill bg-surface-raised font-bold text-on-dark ring-2 ring-purple-soft/40";

/**
 * Initials avatar (circular). When `src` is provided it shows the image and
 * falls back to initials if the file is missing.
 */
export function Avatar({ name, size = "md", src, className, ...rest }: AvatarProps) {
  const initials = (
    <span role="img" aria-label={name} className={cn(ringClasses, sizeClasses[size], className)} {...rest}>
      {getInitials(name)}
    </span>
  );
  if (!src) return initials;
  return (
    <span className={cn(ringClasses, "p-0", sizeClasses[size], className)} aria-label={name} role="img">
      <AssetImage src={src} alt={name} className="size-full object-cover" fallback={<span aria-hidden>{getInitials(name)}</span>} />
    </span>
  );
}
