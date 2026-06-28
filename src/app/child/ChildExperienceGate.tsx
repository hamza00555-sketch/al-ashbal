"use client";

/*
  Shared-family-device gate for the child area. Resolves the ACTIVE child on
  this device and:
    - shows the profile picker (من يستخدم التطبيق الآن؟) when none is selected,
    - otherwise provides the active child to child pages via context and renders
      a small identity strip (+ تبديل الطفل).
  /child/start (onboarding) and /child/switch (the picker itself) are NOT gated.
*/
import { createContext, useContext, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, ChildDisplayAvatar, ChildDisplayName } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import type { ChildProfile } from "@/types";
import { useHydrated, useResolvedActiveChild } from "@/lib/demo/deviceChildren";
import { ChildPicker } from "./ChildPicker";

const ActiveChildContext = createContext<ChildProfile | null>(null);

/** The resolved active child for the current child page (guaranteed non-null
 *  because the gate renders the picker when there is no active child). */
export function useActiveChild(): ChildProfile {
  const child = useContext(ActiveChildContext);
  if (!child) {
    throw new Error("useActiveChild must be used inside an active child gate");
  }
  return child;
}

const UNGATED = ["/child/start", "/child/switch"];

function ChildActiveBar({ child }: { child: ChildProfile }) {
  return (
    <Card variant="lavender" className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <ChildDisplayAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} size="md" />
        <div className="flex min-w-0 flex-col">
          <span className="text-caption text-on-dark-muted">تستخدم التطبيق الآن باسم</span>
          <span className="break-words text-card-title font-bold">
            <ChildDisplayName childId={child.id} fallback={child.displayName} />
          </span>
        </div>
      </div>
      <Link
        href="/child/switch"
        className="inline-flex min-h-9 shrink-0 items-center rounded-md bg-surface-raised px-4 text-caption font-bold text-on-dark ring-1 ring-purple/12 transition hover:bg-purple/8"
      >
        تبديل الطفل
      </Link>
    </Card>
  );
}

function GatePlaceholder() {
  return (
    <Card variant="lavender" className="flex items-center justify-center py-10">
      <span className="text-body text-on-dark-muted">جارٍ التحميل…</span>
    </Card>
  );
}

export function ChildExperienceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { child } = useResolvedActiveChild();

  // Onboarding and the switcher render freely (no active child required).
  if (pathname && UNGATED.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }
  // Avoid flashing the picker before the device state is known on the client.
  if (!hydrated) return <GatePlaceholder />;
  if (!child) return <ChildPicker />;

  return (
    <ActiveChildContext.Provider value={child}>
      <div className="flex flex-col gap-4">
        <ChildActiveBar child={child} />
        {children}
      </div>
    </ActiveChildContext.Provider>
  );
}
