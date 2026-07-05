"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Badge } from "../ui/Badge";
import { Drawer } from "../ui/Drawer";

interface Experience {
  id: string;
  label: string;
  href: string;
  soon?: boolean;
}

const EXPERIENCES: Experience[] = [
  { id: "child", label: "تجربة الطفل", href: "/child" },
  { id: "parent", label: "تجربة ولي الأمر", href: "/parent" },
  { id: "teacher", label: "لوحة المعلم", href: "/teacher" },
  { id: "guest", label: "ضيف الشرف", href: "/guest" },
  { id: "style-guide", label: "دليل التصميم", href: "/style-guide" },
  { id: "home", label: "الصفحة الرئيسية", href: "/" },
];

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <path d="M7 7h11l-3-3M17 17H6l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Demo-only experience switcher (NOT real auth/login). Opens a side drawer with
 * links to the different role experiences.
 */
export function DemoExperienceSwitcher({ current, compact = false }: { current?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const rowBase = "flex items-center justify-between gap-3 rounded-md px-4 py-3 text-button transition";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="تبديل التجربة"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill font-bold transition",
          compact
            ? // Quiet/dev affordance — does not compete with the real action.
              "px-2.5 py-1 text-[11px] text-cream/55 hover:bg-white/10 hover:text-cream"
            : "bg-surface-raised px-4 py-2 text-caption text-on-dark hover:bg-purple/8",
        )}
      >
        <span className={cn("inline-flex", compact ? "size-3.5" : "size-4")}><SwapIcon /></span>
        تبديل التجربة
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="تبديل التجربة">
        <p className="text-caption text-on-dark-muted">
          تبديل التجربة في النسخة التجريبية — ليس تسجيل دخول.
        </p>
        <nav className="mt-2 flex flex-col gap-2">
          {EXPERIENCES.map((x) =>
            x.soon ? (
              <span
                key={x.id}
                aria-disabled="true"
                className={cn(rowBase, "cursor-not-allowed bg-surface-raised text-on-dark-muted opacity-60")}
              >
                {x.label}
                <Badge tone="neutral">قريبًا</Badge>
              </span>
            ) : (
              <Link
                key={x.id}
                href={x.href}
                prefetch={false} // targets include auth-gated layouts — no background auth work
                onClick={() => setOpen(false)}
                className={cn(
                  rowBase,
                  current === x.id
                    ? "bg-purple/15 text-purple-soft"
                    : "bg-surface-raised text-on-dark hover:bg-purple/8",
                )}
              >
                {x.label}
                {current === x.id && <Badge tone="purple">الحالية</Badge>}
              </Link>
            ),
          )}
        </nav>
      </Drawer>
    </>
  );
}
