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
        "fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around gap-2xs",
        "border-t border-white/10 bg-surface/95 px-sm pt-xs pb-2xs backdrop-blur md:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const itemClass = cn(
          "flex flex-1 flex-col items-center justify-center gap-2xs rounded-md py-xs text-caption transition",
          active ? "text-purple-soft" : "text-on-dark-muted hover:text-on-dark",
        );
        const inner = (
          <>
            {item.icon && (
              <span className="inline-flex size-6 items-center justify-center">
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
  );
}
