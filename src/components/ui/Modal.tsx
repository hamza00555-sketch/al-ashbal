"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight modal / bottom-sheet (no deps).
 * Bottom sheet on mobile, centered dialog on md+. Backdrop click closes.
 * Portaled to <body>: rendered inline it would sit inside the layout's
 * stacking context (relative z-10), BELOW the fixed z-40 bottom nav — which
 * then intercepts taps on the sheet's bottom buttons (e.g. confirm approve).
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-night/70 backdrop-blur-sm"
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-surface-raised p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-card ring-1 ring-purple/10 md:rounded-xl md:pb-6",
          className,
        )}
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
        {children}
      </div>
    </div>,
    document.body,
  );
}
