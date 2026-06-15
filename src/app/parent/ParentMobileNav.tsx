"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components";
import { parentNavItems } from "./_nav";

/** Parent bottom nav with active state from the current route (real links). */
export function ParentMobileNav() {
  const pathname = usePathname();
  const active = parentNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return <MobileNav items={parentNavItems} activeId={active} />;
}
