"use client";

import { MobileNav, type NavItem } from "@/components";
import { IconBell, IconHome, IconUsers } from "./_icons";

// Single calm dashboard: the nav jumps to the page's sections.
const items: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "#top", icon: <IconHome /> },
  { id: "children", label: "أطفالي", href: "#children", icon: <IconUsers /> },
  { id: "alerts", label: "التنبيهات", href: "#alerts", icon: <IconBell /> },
];

export function ParentMobileNav() {
  return <MobileNav items={items} activeId="home" />;
}
