"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "@/components";
import { teacherNavItems } from "./_nav";

/** Desktop side navigation for the teacher dashboard (hidden on mobile). */
export function TeacherDesktopNav() {
  const pathname = usePathname();
  const active = teacherNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return (
    <DesktopSidebar
      items={teacherNavItems}
      activeId={active}
      header={<span className="text-card-title font-extrabold text-on-dark">الأشبال · المعلم</span>}
    />
  );
}
