"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "@/components";
import { childNavItems } from "./_nav";

/** Desktop side navigation for the child area (hidden on mobile by the component). */
export function ChildDesktopNav() {
  const pathname = usePathname();
  const active = childNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return (
    <DesktopSidebar
      items={childNavItems}
      activeId={active}
      header={<span className="text-card-title font-extrabold text-on-dark">الأشبال</span>}
    />
  );
}
