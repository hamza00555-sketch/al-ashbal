import type { NavItem } from "@/components";
import { IconBook, IconHome, IconSparkle, IconStar } from "./_icons";

/** Real cross-page navigation for the child area (no scroll anchors). */
export const childNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/child", icon: <IconHome /> },
  { id: "lessons", label: "الدروس", href: "/child/lessons", icon: <IconBook /> },
  { id: "progress", label: "تقدّمي", href: "/child/progress", icon: <IconStar /> },
  { id: "wishes", label: "أمنياتي", href: "/child/wishes", icon: <IconSparkle /> },
];
