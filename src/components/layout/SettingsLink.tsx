import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/auth/types";

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.8 5.8l1.4 1.4M16.8 16.8l1.4 1.4M18.2 5.8l-1.4 1.4M7.2 16.8l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Small, unobtrusive link to /settings for the role home headers. Carries the
 * role so settings edits the right profile. Stays fixed on mobile: it never
 * shrinks (shrink-0), the label never wraps (whitespace-nowrap), and the icon
 * always shows.
 */
export function SettingsLink({
  label = "الإعدادات",
  role,
  className,
}: {
  label?: string;
  role?: Role;
  className?: string;
}) {
  const href = role ? `/settings?role=${role}` : "/settings";
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft",
        className,
      )}
    >
      <span className="inline-flex size-4 shrink-0 text-purple-soft"><GearIcon /></span>
      <span className="max-w-[8rem] truncate">{label}</span>
    </Link>
  );
}
