import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "raised" | "contrast" | "gradient" | "plum" | "lavender";

const variantClasses: Record<CardVariant, string> = {
  // Default surface — soft white/warm card with highlight + plum hairline border.
  surface: "card-elevated text-on-dark",
  // Emphasis card — same finish with a slightly stronger soft shadow/glow.
  raised: "card-glow text-on-dark",
  // Soft lavender-cream accent card — deep-plum text.
  contrast: "card-contrast shadow-soft ring-1 ring-purple/10",
  // Hero card — PURPLE gradient with light (cream) text + soft glow.
  gradient: "gradient-hero text-cream shadow-glow ring-1 ring-white/15",
  // Calm dark-plum surface with cream text (flat, no gradient/glow). Info-first.
  plum: "bg-[#34164a] text-cream ring-1 ring-white/10 shadow-card",
  // Soft solid lavender with deep-plum text — secondary/calm purple surface.
  lavender: "bg-[#E6DAFF] text-[#2B1238] ring-1 ring-[#6940A5]/15 shadow-soft",
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
      className={cn("rounded-lg", padded && "p-4", variantClasses[variant], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
