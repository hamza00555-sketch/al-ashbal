"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "@/components";
import { teacherNavItems } from "./_nav";
import { useTeacherReviewCount } from "./useReviewCount";

/** Teacher bottom nav with active state from the current route (mobile fallback). */
export function TeacherMobileNav({
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
  return <MobileNav items={items} activeId={active} />;
}
