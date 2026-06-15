"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components";
import { teacherNavItems } from "./_nav";

/** Teacher bottom nav with active state from the current route (mobile fallback). */
export function TeacherMobileNav() {
  const pathname = usePathname();
  const active = teacherNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return <MobileNav items={teacherNavItems} activeId={active} />;
}
