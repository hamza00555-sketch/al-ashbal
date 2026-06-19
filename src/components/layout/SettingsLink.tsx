import Link from "next/link";
import { cn } from "@/lib/cn";

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
 * Small, unobtrusive link to /settings for the role home headers.
 * Not a route guard, not in the bottom nav — just an entry point.
 */
export function SettingsLink({ label = "الإعدادات", className }: { label?: string; className?: string }) {
  return (
    <Link
      href="/settings"
      aria-label={label}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft",
        className,
      )}
    >
      <span className="inline-flex size-4 text-purple-soft"><GearIcon /></span>
      {label}
    </Link>
  );
}
