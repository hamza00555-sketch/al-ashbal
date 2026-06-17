import { AppIcon, type NavItem } from "@/components";
import { IconActivity, IconCalendar, IconHome, IconPrep, IconUsers, IconVideo } from "./_icons";

/** Desktop sidebar navigation for the teacher area.
 *  أدوات التجربة intentionally NOT here — they live in /style-guide.
 *  Icons use brand PNGs when present (/assets/icons/...), else the inline SVG. */
export const teacherNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/teacher", icon: <AppIcon name="icon_home" fallback={<IconHome />} /> },
  { id: "prep", label: "التحضير", href: "/teacher/prep", icon: <AppIcon name="icon_preparation" fallback={<IconPrep />} /> },
  { id: "attendance", label: "الحضور", href: "/teacher/attendance", icon: <AppIcon name="icon_attendance" fallback={<IconCalendar />} /> },
  { id: "children", label: "الأطفال", href: "/teacher/children", icon: <AppIcon name="icon_children" fallback={<IconUsers />} /> },
  { id: "reviews", label: "المراجعات", href: "/teacher/reviews", icon: <AppIcon name="icon_review" fallback={<IconVideo />} /> },
  { id: "activities", label: "الأنشطة", href: "/teacher/activities", icon: <AppIcon name="icon_activity" fallback={<IconActivity />} /> },
];

/** Simplified MOBILE bottom nav — only the daily essentials (الحضور · الرئيسية · المراجعات).
 *  The rest of the teacher pages are reached from the cards on /teacher. */
export const teacherBottomNavItems: NavItem[] = [
  { id: "attendance", label: "الحضور", href: "/teacher/attendance", icon: <AppIcon name="icon_attendance" fallback={<IconCalendar />} /> },
  { id: "home", label: "الرئيسية", href: "/teacher", icon: <AppIcon name="icon_home" fallback={<IconHome />} /> },
  { id: "reviews", label: "المراجعات", href: "/teacher/reviews", icon: <AppIcon name="icon_review" fallback={<IconVideo />} /> },
];
