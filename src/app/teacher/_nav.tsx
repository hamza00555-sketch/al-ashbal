import type { NavItem } from "@/components";
import { IconCalendar, IconHome, IconUsers, IconVideo } from "./_icons";

/** Real cross-page navigation for the teacher area (no scroll anchors). */
export const teacherNavItems: NavItem[] = [
  { id: "home", label: "نظرة عامة", href: "/teacher", icon: <IconHome /> },
  { id: "children", label: "أطفال الحلقة", href: "/teacher/children", icon: <IconUsers /> },
  { id: "attendance", label: "الحضور", href: "/teacher/attendance", icon: <IconCalendar /> },
  { id: "reviews", label: "المراجعة", href: "/teacher/reviews", icon: <IconVideo /> },
];
