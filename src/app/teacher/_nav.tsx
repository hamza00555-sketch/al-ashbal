import type { NavItem } from "@/components";
import { IconActivity, IconCalendar, IconHome, IconPrep, IconTools, IconUsers, IconVideo } from "./_icons";

/** Real cross-page navigation for the teacher area (no scroll anchors). */
export const teacherNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/teacher", icon: <IconHome /> },
  { id: "prep", label: "التحضير", href: "/teacher/prep", icon: <IconPrep /> },
  { id: "attendance", label: "الحضور", href: "/teacher/attendance", icon: <IconCalendar /> },
  { id: "children", label: "الأطفال", href: "/teacher/children", icon: <IconUsers /> },
  { id: "reviews", label: "المراجعات", href: "/teacher/reviews", icon: <IconVideo /> },
  { id: "activities", label: "الأنشطة", href: "/teacher/activities", icon: <IconActivity /> },
  { id: "demo-tools", label: "أدوات التجربة", href: "/teacher/demo-tools", icon: <IconTools /> },
];
