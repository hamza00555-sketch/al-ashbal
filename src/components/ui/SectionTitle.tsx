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
        <h2 className="text-h2 text-on-dark">{title}</h2>
        {subtitle && <p className="text-caption text-on-dark-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
