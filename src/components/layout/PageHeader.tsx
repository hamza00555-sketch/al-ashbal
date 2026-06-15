import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small label above the title (e.g. a greeting or section name). */
  eyebrow?: ReactNode;
  /** Leading slot, e.g. an Avatar. */
  leading?: ReactNode;
  /** Trailing actions, e.g. buttons / badges. */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  leading,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-4">
        {leading}
        <div className="flex flex-col gap-1">
          {eyebrow && <span className="text-caption text-on-dark-muted">{eyebrow}</span>}
          <h1 className="text-h1 text-on-dark">{title}</h1>
          {subtitle && <p className="text-body text-on-dark-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
