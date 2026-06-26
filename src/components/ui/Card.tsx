import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "raised" | "contrast" | "gradient";

const variantClasses: Record<CardVariant, string> = {
  // Default surface — soft white/warm card with highlight + plum hairline border.
  surface: "card-elevated text-on-dark",
  // Emphasis card — same finish with a slightly stronger soft shadow/glow.
  raised: "card-glow text-on-dark",
  // Soft lavender-cream accent card — deep-plum text.
  contrast: "card-contrast shadow-soft ring-1 ring-purple/10",
  // Hero card — PURPLE gradient with light (cream) text + soft glow.
  gradient: "gradient-hero text-cream shadow-glow ring-1 ring-white/15",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padded?: boolean;
}

export function Card({
  variant = "surface",
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn("rounded-lg", padded && "p-6", variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
