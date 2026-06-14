"use client";

import { cn } from "@/lib/cn";

export interface RoleOption {
  id: string;
  label: string;
}

export interface RoleSwitcherProps {
  roles: RoleOption[];
  current: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Mock/demo-only control for switching the active role while previewing the
 * UI. Real auth replaces this in a later phase.
 */
export function RoleSwitcher({
  roles,
  current,
  onChange,
  className,
}: RoleSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="تبديل الدور (للعرض فقط)"
      className={cn(
        "inline-flex flex-wrap items-center gap-2xs rounded-pill bg-surface-raised p-2xs",
        className,
      )}
    >
      {roles.map((role) => {
        const active = role.id === current;
        return (
          <button
            key={role.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(role.id)}
            className={cn(
              "rounded-pill px-md py-2xs text-caption font-bold transition",
              active
                ? "gradient-cta text-cream shadow-glow"
                : "text-on-dark-muted hover:text-on-dark",
            )}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
