/*
  Shared form-control primitives — ONE source of truth for the app's input look
  (previously hand-copied in 12+ files, with color drift). No "use client": these
  are presentational; interactive handlers come from the importing client
  component.

  - <Input> / <Select>: the standard control. Pass `dir="ltr"` for Latin code
    fields (FAM-XXXX codes, emails) so the caret behaves in the RTL layout.
  - <Field label="…">: a <label> wrapper that associates the label with the
    control for screen readers (wrapping association — no id needed).
  - inputClass / fieldLabel: exported for the rare custom control that can't use
    the components.
*/
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";

export const fieldLabel = "text-caption text-on-dark-muted";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, className)} {...rest}>
      {children}
    </select>
  );
}

/** Label + control, associated for assistive tech via label wrapping. */
export function Field({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
