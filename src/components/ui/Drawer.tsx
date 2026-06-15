"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

/**
 * Side drawer. Slides in from the physical right edge (the natural side in our
 * RTL UI) with an overlay fade. Stays mounted so the slide animation runs.
 */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* overlay (fade) */}
      <button
        type="button"
        aria-label="إغلاق"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-night/70 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      {/* panel (slide-in from the right) */}
      <div
        role="dialog"
        aria-modal="true"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
        className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col gap-4 bg-surface p-6 shadow-soft transition-transform duration-300 will-change-transform"
      >
        <div className="flex items-center justify-between gap-4">
          {title ? <h2 className="text-h2 text-on-dark">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-surface-raised text-on-dark-muted transition hover:text-on-dark"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
