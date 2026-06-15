import type { NavItem } from "@/components";
import { IconHome, IconUsers, IconVideo } from "./_icons";

/** Real cross-page navigation for the parent area (no scroll anchors). */
export const parentNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/parent", icon: <IconHome /> },
  { id: "children", label: "أطفالي", href: "/parent/children", icon: <IconUsers /> },
  { id: "approvals", label: "الموافقات", href: "/parent/approvals", icon: <IconVideo /> },
];
