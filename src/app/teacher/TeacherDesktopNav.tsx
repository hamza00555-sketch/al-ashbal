"use client";

import { usePathname } from "next/navigation";
import { DesktopSidebar } from "@/components";
import { teacherNavItems } from "./_nav";
import { useTeacherReviewCount } from "./useReviewCount";

/** Desktop side navigation for the teacher dashboard (hidden on mobile). */
export function TeacherDesktopNav({
  teacherId,
  dbPendingReviews,
}: {
  teacherId: string;
  dbPendingReviews: number;
}) {
  const pathname = usePathname();
  const reviewCount = useTeacherReviewCount(teacherId, dbPendingReviews);
  const items = teacherNavItems.map((item) =>
    item.id === "reviews" ? { ...item, badge: reviewCount } : item,
  );
  const active = teacherNavItems.find((item) => item.href === pathname)?.id ?? "home";
  return (
    <DesktopSidebar
      items={items}
      activeId={active}
      header={<span className="text-card-title font-extrabold text-on-dark">الأشبال · المعلم</span>}
    />
  );
}
