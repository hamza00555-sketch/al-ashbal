import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "gold"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "neutral";

// DEFAULT palette: readable ON the light cards (soft tint fill + dark text).
const toneOnLight: Record<BadgeTone, string> = {
  gold: "gradient-badge text-on-light",
  success: "bg-[#E3F3EA] text-[#1E5C3A] ring-1 ring-[#1E5C3A]/25",
  warning: "bg-[#FBEFD0] text-[#7A4B00] ring-1 ring-[#7A4B00]/30",
  danger: "bg-[#FBE2DD] text-[#8A2C20] ring-1 ring-[#8A2C20]/30",
  purple: "bg-[#ECE3FF] text-[#3A1A6E] ring-1 ring-[#3A1A6E]/20",
  neutral: "bg-[#EFE9F6] text-[#3A2E55] ring-1 ring-[#3A2E55]/15",
};

// ACCENT palette: light text on translucent fills — for the PURPLE hero cards.
const toneOnAccent: Record<BadgeTone, string> = {
  gold: "gradient-badge text-on-light",
  success: "bg-[rgba(47,191,120,0.22)] text-cream ring-1 ring-[rgba(47,191,120,0.55)]",
  warning: "bg-[rgba(240,199,94,0.22)] text-[#FFF2C2] ring-1 ring-[rgba(240,199,94,0.55)]",
  danger: "bg-[rgba(233,137,126,0.24)] text-[#FFE4DF] ring-1 ring-[rgba(233,137,126,0.58)]",
  purple: "bg-[rgba(255,255,255,0.18)] text-cream ring-1 ring-[rgba(255,255,255,0.32)]",
  neutral: "bg-[rgba(255,255,255,0.16)] text-cream ring-1 ring-[rgba(255,255,255,0.30)]",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
  /** Light-text palette for badges sitting on a PURPLE hero surface. */
  onAccent?: boolean;
  /** Deprecated alias — the light-card palette is the default now. Kept for compat. */
  onLight?: boolean;
}

export function Badge({
  tone = "neutral",
  icon,
  onAccent = false,
  onLight: _onLight,
  className,
  children,
  ...rest
}: BadgeProps) {
  void _onLight; // back-compat no-op: the light-card palette is the default now.
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-caption font-bold leading-none",
        (onAccent ? toneOnAccent : toneOnLight)[tone],
        className,
      )}
      {...rest}
    >
      {icon && <span className="inline-flex size-4 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
