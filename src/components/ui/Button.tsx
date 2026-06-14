"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
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
  primary: "gradient-cta text-cream shadow-glow hover:brightness-110",
  secondary:
    "bg-surface-raised text-on-dark border border-purple-soft/40 hover:border-purple-soft",
  ghost: "bg-transparent text-on-dark-muted hover:bg-white/5 hover:text-on-dark",
  surface: "bg-surface text-on-dark border border-white/10 hover:bg-surface-raised",
  contrast: "bg-cream text-on-light shadow-soft hover:brightness-95",
  danger: "bg-coral text-on-light hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-2xs rounded-md px-md py-2xs text-caption",
  md: "min-h-11 gap-xs rounded-md px-lg py-sm text-button",
  lg: "min-h-12 gap-xs rounded-lg px-xl py-sm text-button",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer select-none items-center justify-center font-bold transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
    </button>
  );
}
