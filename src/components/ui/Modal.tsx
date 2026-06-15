"use client";

import type { ReactNode } from "react";
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
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
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
          "relative z-10 flex w-full max-w-md flex-col gap-4 rounded-t-xl bg-surface p-6 shadow-soft md:rounded-xl",
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
    </div>
  );
}
