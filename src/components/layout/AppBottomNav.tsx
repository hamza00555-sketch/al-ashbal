"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AppAssetIcon } from "../ui/AppAssetIcon";

/**
 * Shared mobile bottom navigation (child / teacher / parent) — one consistent
 * system. Fixed bar height; icons use the unified AppAssetIcon (fixed container
 * + scaled artwork). A `center` item renders larger (hero) for emphasis, the
 * rest use the `nav` size — matching the child bar exactly.
 */
export interface BottomNavItem {
  id: string;
  label: string;
  href: string;
  /** Brand PNG path, e.g. /assets/icons/icon_home.png */
  src: string;
  /** Inline-SVG fallback shown until the PNG loads / if missing. */
  fallback?: ReactNode;
  /** Render larger + centered emphasis (the home button). */
  center?: boolean;
  /** Per-icon artwork scale override (for PNGs with extra transparent margin). */
  artworkScale?: number;
  /** Optional count pill (e.g. pending reviews). Hidden when 0/undefined. */
  badge?: number;
}

export function AppBottomNav({ items, activeId }: { items: BottomNavItem[]; activeId?: string }) {
  return (
    <nav
      aria-label="التنقل"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#23124f]/95 text-cream backdrop-blur pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.30)] md:hidden"
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[430px] items-end justify-around gap-2 px-6 pb-2">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-end gap-0.5 text-[13px] leading-none transition",
                active ? "font-bold text-gold" : "text-cream/60 hover:text-cream",
              )}
            >
              <span className="relative inline-flex">
                <AppAssetIcon
                  src={item.src}
                  size={item.center ? "hero" : "nav"}
                  variant={item.center ? "plain" : "nav"}
                  artworkScale={item.artworkScale}
                  fallback={item.fallback}
                />
                {item.badge ? (
                  <span className="absolute -top-1 -end-1 inline-flex min-w-4 items-center justify-center rounded-pill bg-coral px-1 text-[0.625rem] font-bold leading-none text-cream">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
