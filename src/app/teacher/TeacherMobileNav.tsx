"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components";
import { teacherBottomNavItems } from "./_nav";
import { useTeacherReviewCount } from "./useReviewCount";

/** Teacher bottom nav (mobile) — slimmed to the daily essentials. */
export function TeacherMobileNav({
  teacherId,
  dbPendingReviews,
}: {
  teacherId: string;
  dbPendingReviews: number;
}) {
  const pathname = usePathname();
  const reviewCount = useTeacherReviewCount(teacherId, dbPendingReviews);
  const items = teacherBottomNavItems.map((item) =>
    item.id === "reviews" ? { ...item, badge: reviewCount } : item,
  );
  const active = teacherBottomNavItems.find((item) => item.href === pathname)?.id ?? "";
  return <MobileNav items={items} activeId={active} />;
}
