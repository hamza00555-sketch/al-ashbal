"use client";

/*
  أدوات المعلم على الجوال — burger button + right-side drawer (RTL).
  Mobile-only (md:hidden): the desktop sidebar already lists every tool. The
  drawer shows the SAME single source of truth (teacherNavItems from _nav) so
  طلبات الانضمام and every other tool is reachable from a phone.
  Layout/navigation only — no auth or backend changes.
*/
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components";
import { teacherNavItems } from "./_nav";
import { useTeacherReviewCount } from "./useReviewCount";
import { TeacherLogoutButton } from "./TeacherLogoutButton";

export function TeacherToolsDrawer({
  teacherId,
  dbPendingReviews,
}: {
  teacherId: string;
  dbPendingReviews: number;
}) {
  const [open, setOpen] = useState(false);
  // Client-side «navigating» overlay: with prefetch disabled on protected
  // links (auth-storm fix), the server needs a moment before loading.tsx can
  // stream — this overlay makes the tap feel instant regardless.
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();
  const reviewCount = useTeacherReviewCount(teacherId, dbPendingReviews);

  // Navigation committed (pathname changed) → clear the overlay. This is the
  // React "adjust state during render" pattern (no effect, no extra paint).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setNavigating(false);
  }

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح أدوات المعلم"
        aria-expanded={open}
        className="inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-purple/8 hover:ring-purple-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
      >
        <span aria-hidden className="text-body leading-none">☰</span>
        أدوات المعلم
      </button>

      {/* Portal to <body>: the layout content creates a stacking context
          (relative z-10 in AppShell), so a fixed drawer rendered inline would
          sit BELOW the z-40 bottom nav no matter its own z-index. */}
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label="أدوات المعلم" className="fixed inset-0 z-50">
          {/* backdrop — tap outside to close */}
          <button
            type="button"
            aria-label="إغلاق أدوات المعلم"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-night/70 backdrop-blur-sm"
          />
          <nav
            aria-label="أدوات المعلم"
            className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto rounded-l-lg bg-surface-raised p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-on-dark shadow-soft ring-1 ring-purple/15 motion-safe:animate-[ash-drawer-in_0.22s_ease-out]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-card-title font-extrabold text-on-dark">أدوات المعلم</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="inline-flex size-9 items-center justify-center rounded-pill bg-purple/10 text-body font-bold text-on-dark transition hover:bg-purple/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {teacherNavItems.map((item) => {
                const href = item.href ?? "/teacher"; // NavItem.href is optional in the type only
                const active = pathname === href;
                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      prefetch={false} // protected route — no background auth
                      onClick={() => {
                        setOpen(false);
                        if (!active) setNavigating(true); // same page → no overlay
                      }}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-body transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft ${
                        active
                          ? "bg-purple/15 font-bold text-on-dark"
                          : "text-on-dark-muted hover:bg-purple/8 hover:text-on-dark"
                      }`}
                    >
                      <span className="inline-flex size-6 shrink-0 items-center justify-center">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.id === "reviews" && reviewCount > 0 && <Badge tone="gold">{reviewCount}</Badge>}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* Account action pinned at the bottom of the tools list. */}
            <div className="mt-auto border-t border-purple/12 pt-2">
              <TeacherLogoutButton variant="drawer" />
            </div>
          </nav>
        </div>,
        document.body,
      )}

      {/* Instant tap feedback while the route responds (cleared on pathname change). */}
      {navigating && createPortal(
        <div aria-hidden className="fixed inset-0 z-50 flex flex-col items-center bg-night/40 pt-[18vh] backdrop-blur-[2px]">
          <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-lg p-6 text-center card-elevated text-on-dark">
            <span className="inline-block size-8 rounded-pill border-[3px] border-purple/20 border-t-purple motion-safe:animate-spin" />
            <p className="text-body font-bold">جاري فتح أدوات المعلم...</p>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
