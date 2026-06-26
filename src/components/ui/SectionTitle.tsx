import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional trailing slot, e.g. a "see all" link or button. */
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  action,
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex flex-col gap-1">
        {/* Inherits color from context: cream on the plum canvas, deep-plum
            inside cream cards. */}
        <h2 className="text-h2">{title}</h2>
        {subtitle && <p className="text-caption opacity-70">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
