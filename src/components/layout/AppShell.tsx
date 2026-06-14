import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AppShellProps {
  /** Desktop sidebar slot (hidden on mobile by the component itself). */
  sidebar?: ReactNode;
  /** Mobile bottom navigation slot (hidden on desktop by the component itself). */
  mobileNav?: ReactNode;
  /** Optional sticky-ish header area above the main content. */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * App layout frame. RTL-first: in a flex row under dir="rtl" the sidebar
 * naturally sits on the right (inline-start). Extra bottom padding on mobile
 * keeps content clear of the bottom nav.
 */
export function AppShell({
  sidebar,
  mobileNav,
  header,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh bg-surface text-on-dark", className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header && <div className="px-lg pt-lg">{header}</div>}
        <main className="flex-1 px-lg py-lg pb-24 md:pb-lg">{children}</main>
      </div>
      {mobileNav}
    </div>
  );
}
