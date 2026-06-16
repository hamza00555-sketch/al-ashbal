import { AppIcon, type NavItem } from "@/components";
import { IconActivity, IconCalendar, IconHome, IconPrep, IconTools, IconUsers, IconVideo } from "./_icons";

/** Real cross-page navigation for the teacher area (no scroll anchors).
 *  Icons use brand PNGs when present (/assets/icons/...), else the inline SVG. */
export const teacherNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/teacher", icon: <AppIcon name="icon_home" fallback={<IconHome />} /> },
  { id: "prep", label: "التحضير", href: "/teacher/prep", icon: <AppIcon name="icon_preparation" fallback={<IconPrep />} /> },
  { id: "attendance", label: "الحضور", href: "/teacher/attendance", icon: <AppIcon name="icon_attendance" fallback={<IconCalendar />} /> },
  { id: "children", label: "الأطفال", href: "/teacher/children", icon: <AppIcon name="icon_children" fallback={<IconUsers />} /> },
  { id: "reviews", label: "المراجعات", href: "/teacher/reviews", icon: <AppIcon name="icon_review" fallback={<IconVideo />} /> },
  { id: "activities", label: "الأنشطة", href: "/teacher/activities", icon: <AppIcon name="icon_activity" fallback={<IconActivity />} /> },
  { id: "demo-tools", label: "أدوات التجربة", href: "/teacher/demo-tools", icon: <AppIcon name="icon_demo_tools" fallback={<IconTools />} /> },
];
