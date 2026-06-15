"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { NavItem } from "./types";

export interface DesktopSidebarProps {
  items: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Top slot, e.g. a brand mark. */
  header?: ReactNode;
  /** Bottom slot, e.g. a RoleSwitcher or user card. */
  footer?: ReactNode;
  className?: string;
}

export function DesktopSidebar({
  items,
  activeId,
  onSelect,
  header,
  footer,
  className,
}: DesktopSidebarProps) {
  return (
    <aside
      aria-label="القائمة الجانبية"
      className={cn(
        // border-s = inline-start border → the right edge in RTL.
        "hidden w-64 shrink-0 flex-col gap-6 border-s border-white/10 bg-surface p-6 md:flex",
        className,
      )}
    >
      {header}
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.id === activeId;
          const itemClass = cn(
            "flex items-center gap-3 rounded-md px-4 py-3 text-button transition",
            active
              ? "bg-purple/15 text-purple-soft"
              : "text-on-dark-muted hover:bg-white/5 hover:text-on-dark",
          );
          const inner = (
            <>
              {item.icon && (
                <span className="inline-flex size-5 items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </>
          );

          return item.href ? (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={itemClass}
            >
              {inner}
            </Link>
          ) : (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect?.(item.id)}
              className={itemClass}
            >
              {inner}
            </button>
          );
        })}
      </nav>
      {footer && <div className="mt-auto">{footer}</div>}
    </aside>
  );
}
