"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { NavItem } from "./types";

export interface MobileNavProps {
  items: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function MobileNav({ items, activeId, onSelect, className }: MobileNavProps) {
  return (
    <nav
      aria-label="التنقل"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around gap-1",
        "border-t border-purple/12 bg-surface px-3 pt-2 pb-1 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] md:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const itemClass = cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-0.5 py-2 text-caption transition",
          active ? "text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
        );
        const inner = (
          <>
            {item.icon && (
              <span className="relative inline-flex size-6 items-center justify-center">
                {item.icon}
                {item.badge ? (
                  <span className="absolute -top-1 -end-1 inline-flex min-w-4 items-center justify-center rounded-pill bg-coral px-1 text-[0.625rem] font-bold leading-none text-cream">
                    {item.badge}
                  </span>
                ) : null}
              </span>
            )}
            <span className="w-full truncate text-center">{item.label}</span>
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
  );
}
