"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Physical edge the panel slides from. SPATIAL RULE: match the trigger —
   *  the teacher burger sits on the right → right drawer; the notifications
   *  bell sits on the left → left drawer. Default: right (RTL start side). */
  side?: "right" | "left";
  children: ReactNode;
}

/**
 * Side drawer with an overlay fade. The panel is a LIGHT surface, so it sets
 * its own readable base text color (deep plum) — children never inherit the
 * page's cream-on-purple text by accident. Stays mounted so the slide runs.
 */
export function Drawer({ open, onClose, title, side = "right", children }: DrawerProps) {
  // Escape closes (matches the teacher tools drawer behavior).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const fromRight = side === "right";
  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      {/* overlay (fade) — tap outside to close */}
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
      {/* panel (slides from its own edge; light surface → dark readable text) */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          transform: open ? "translateX(0)" : fromRight ? "translateX(100%)" : "translateX(-100%)",
        }}
        className={cn(
          "absolute inset-y-0 flex w-[88%] max-w-sm flex-col gap-4 bg-surface p-5 text-on-dark shadow-soft transition-transform duration-300 will-change-transform",
          fromRight ? "right-0 rounded-l-lg" : "left-0 rounded-r-lg",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          {title ? <h2 className="text-h2 text-on-dark">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill bg-purple/10 text-on-dark transition hover:bg-purple/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
          >
            ✕
          </button>
        </div>
        {/* scroll area clears the device safe area (and any bottom bar) */}
        <div className="min-h-0 flex-1 overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
