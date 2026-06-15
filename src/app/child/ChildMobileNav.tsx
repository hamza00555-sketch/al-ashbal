"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components";
import { childNavItems } from "./_nav";

/** Child bottom nav with active state derived from the current route. */
export function ChildMobileNav() {
  const pathname = usePathname();
  const active = childNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return <MobileNav items={childNavItems} activeId={active} />;
}
