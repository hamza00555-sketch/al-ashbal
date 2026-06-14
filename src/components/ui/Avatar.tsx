import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

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
}

/**
 * Initials avatar (circular). Image support can be layered on later via
 * next/image; the mock phase intentionally uses initials only.
 */
export function Avatar({ name, size = "md", className, ...rest }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-pill bg-surface-raised font-bold text-on-dark ring-2 ring-purple-soft/40",
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {getInitials(name)}
    </span>
  );
}
