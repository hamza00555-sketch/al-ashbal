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
    <header
      className={cn(
        // Purple hero band — anchors every page with brand plum + cream text.
        "gradient-hero relative isolate flex items-start justify-between gap-3 overflow-hidden rounded-lg px-4 py-3.5 text-cream shadow-card ring-1 ring-white/15 sm:gap-4 sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="relative z-10 flex min-w-0 items-center gap-3 sm:gap-4">
        {leading}
        <div className="flex min-w-0 flex-col gap-0.5">
          {eyebrow && <span className="text-caption text-cream/70">{eyebrow}</span>}
          <h1 className="text-h1 break-words text-cream">{title}</h1>
          {subtitle && <p className="text-body text-cream/80">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="relative z-10 flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
