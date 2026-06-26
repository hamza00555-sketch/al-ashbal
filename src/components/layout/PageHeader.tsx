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
        "gradient-hero relative isolate flex items-start justify-between gap-4 overflow-hidden rounded-lg p-5 text-cream shadow-glow ring-1 ring-white/15 sm:p-6",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute -top-10 -start-8 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 flex min-w-0 items-center gap-4">
        {leading}
        <div className="flex min-w-0 flex-col gap-1">
          {eyebrow && <span className="text-caption text-cream/70">{eyebrow}</span>}
          <h1 className="text-h1 break-words text-cream">{title}</h1>
          {subtitle && <p className="text-body text-cream/80">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="relative z-10 flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
