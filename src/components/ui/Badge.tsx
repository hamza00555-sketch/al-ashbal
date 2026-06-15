import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  // Gold is reserved for achievements / awards.
  gold: "gradient-badge text-on-light",
  success: "bg-mint/15 text-mint",
  warning: "bg-gold/15 text-gold",
  danger: "bg-coral/15 text-coral",
  purple: "bg-purple/15 text-purple-soft",
  neutral: "bg-white/8 text-on-dark-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

export function Badge({
  tone = "neutral",
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-caption font-bold",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {icon && <span className="inline-flex size-4 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
