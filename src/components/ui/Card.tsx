import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "raised" | "contrast" | "gradient";

const variantClasses: Record<CardVariant, string> = {
  // Default primary surface — rich purple gradient card with highlight + hairline border.
  surface: "card-elevated text-on-dark",
  // Emphasis card — same gradient with a soft edge glow.
  raised: "card-glow text-on-dark",
  // The LIMITED light card — cream/off-white with dark-purple text.
  contrast: "card-contrast shadow-soft ring-1 ring-black/5",
  // Hero card — brighter lavender→purple gradient with glow + lavender outline.
  gradient: "gradient-hero text-on-dark shadow-glow ring-1 ring-purple-soft/30",
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
