/*
  Shared button class recipe — ONE source of truth for the purple CTA look,
  used by <Button> (native button) and <LinkButton> (next/link). No "use client"
  so server components can use it too.
*/
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "surface"
  | "contrast"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "gradient-cta text-cream shadow-glow ring-1 ring-white/15 hover:brightness-110",
  secondary:
    "bg-surface-raised text-on-dark ring-1 ring-purple/20 shadow-soft hover:ring-purple/40 hover:bg-purple/5",
  ghost: "bg-transparent text-on-dark-muted hover:bg-purple/8 hover:text-on-dark",
  surface: "bg-surface text-on-dark ring-1 ring-purple/12 hover:bg-surface-raised",
  contrast: "bg-cream text-on-light shadow-soft ring-1 ring-purple/10 hover:brightness-[0.97]",
  danger: "bg-coral text-cream shadow-soft hover:brightness-105",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-1 rounded-md px-3.5 py-1 text-caption",
  md: "min-h-11 gap-2 rounded-md px-5 py-2.5 text-button",
  lg: "min-h-11 gap-2 rounded-lg px-6 py-2.5 text-button",
};

export function buttonClasses(opts: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  const { variant = "primary", size = "md", fullWidth = false, className } = opts;
  return cn(
    "inline-flex cursor-pointer select-none items-center justify-center font-bold transition",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}
