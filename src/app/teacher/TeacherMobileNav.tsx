"use client";

import { usePathname } from "next/navigation";
import { AppBottomNav, type BottomNavItem } from "@/components";
import { IconCalendar, IconHome, IconVideo } from "./_icons";
import { useTeacherReviewCount } from "./useReviewCount";

/** Teacher bottom nav (mobile) — الحضور · الرئيسية (وسط) · المراجعات. */
export function TeacherMobileNav({
  teacherId,
  dbPendingReviews,
}: {
  teacherId: string;
  dbPendingReviews: number;
}) {
  const pathname = usePathname();
  const reviewCount = useTeacherReviewCount(teacherId, dbPendingReviews);
  const items: BottomNavItem[] = [
    { id: "attendance", label: "الحضور", href: "/teacher/attendance", src: "/assets/icons/icon_attendance.png", fallback: <IconCalendar /> },
    { id: "home", label: "الرئيسية", href: "/teacher", src: "/assets/icons/icon_home.png", fallback: <IconHome />, center: true },
    { id: "reviews", label: "المراجعات", href: "/teacher/reviews", src: "/assets/icons/icon_review.png", fallback: <IconVideo />, badge: reviewCount },
  ];
  const active = items.find((i) => i.href === pathname)?.id ?? "";
  return <AppBottomNav items={items} activeId={active} />;
}
