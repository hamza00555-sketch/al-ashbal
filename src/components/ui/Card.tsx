import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "raised" | "contrast" | "gradient";

const variantClasses: Record<CardVariant, string> = {
  surface: "bg-surface text-on-dark border border-white/5 shadow-card",
  raised: "bg-surface-raised text-on-dark shadow-card",
  // The LIMITED light card — used sparingly for emphasis / privacy notices.
  contrast: "bg-surface-contrast text-on-light shadow-soft",
  gradient: "gradient-card text-on-dark shadow-card",
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
