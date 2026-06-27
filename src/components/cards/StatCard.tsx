import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card, type CardVariant } from "../ui/Card";

export type StatTone = "purple" | "gold" | "success" | "danger";

const chipClasses: Record<StatTone, string> = {
  purple: "bg-purple/15 text-purple-soft",
  gold: "gradient-badge text-on-light",
  success: "bg-mint/15 text-mint",
  danger: "bg-coral/15 text-coral",
};

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  variant?: CardVariant;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "purple",
  variant = "surface",
  className,
}: StatCardProps) {
  return (
    <Card variant={variant} className={cn("flex items-center gap-3", className)}>
      {icon && (
        <span
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-md",
            chipClasses[tone],
          )}
        >
          {icon}
        </span>
      )}
      {/* Secondary text uses opacity so the card works on dark OR contrast surfaces. */}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-caption opacity-70">{label}</span>
        <span className="text-h2 font-extrabold">{value}</span>
        {hint && <span className="text-caption opacity-70">{hint}</span>}
      </div>
    </Card>
  );
}
