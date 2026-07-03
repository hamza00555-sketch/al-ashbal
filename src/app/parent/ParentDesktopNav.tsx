"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "@/components";
import { parentNavItems } from "./_nav";

/** Desktop side navigation for the parent area (hidden on mobile). */
export function ParentDesktopNav() {
  const pathname = usePathname();
  const active = parentNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return (
    <DesktopSidebar
      prefetchLinks={false} // parent layout does per-request auth
      items={parentNavItems}
      activeId={active}
      header={<span className="text-card-title font-extrabold text-cream">الأشبال</span>}
    />
  );
}
