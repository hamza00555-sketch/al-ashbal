import { AppIcon, type NavItem } from "@/components";
import { IconBook, IconHome, IconSparkle, IconStar, IconTasks } from "./_icons";

/** Real cross-page navigation for the child area (no scroll anchors).
 *  Icons use brand PNGs when present (/assets/icons/...), else the inline SVG. */
export const childNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/child", icon: <AppIcon name="icon_home" fallback={<IconHome />} /> },
  { id: "lessons", label: "الدروس", href: "/child/lessons", icon: <AppIcon name="icon_lessons" fallback={<IconBook />} /> },
  { id: "tasks", label: "مهامي", href: "/child/tasks", icon: <AppIcon name="icon_tasks" fallback={<IconTasks />} /> },
  { id: "progress", label: "تقدّمي", href: "/child/progress", icon: <AppIcon name="icon_progress" fallback={<IconStar />} /> },
  { id: "wishes", label: "أمنياتي", href: "/child/wishes", icon: <AppIcon name="icon_wishes" fallback={<IconSparkle />} /> },
];
