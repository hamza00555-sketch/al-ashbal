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
  // Clearer chips: more opaque background + hairline ring + cream/clear text,
  // so small tags ("اليوم" / "حاضر") stay readable on the bright purple cards.
  // Gold is reserved for achievements / awards.
  gold: "gradient-badge text-on-light",
  // Deep emerald (NOT mint/cyan) for success/present.
  success: "bg-[rgba(52,168,107,0.22)] text-cream ring-1 ring-[rgba(52,168,107,0.45)]",
  warning: "bg-[rgba(240,199,94,0.20)] text-gold ring-1 ring-[rgba(240,199,94,0.4)]",
  danger: "bg-[rgba(233,137,126,0.22)] text-cream ring-1 ring-[rgba(233,137,126,0.45)]",
  // Dark translucent chip so it reads clearly ON a purple card (e.g. "اليوم").
  purple: "bg-[rgba(36,18,72,0.55)] text-cream ring-1 ring-white/18",
  neutral: "bg-white/14 text-cream ring-1 ring-white/18",
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
