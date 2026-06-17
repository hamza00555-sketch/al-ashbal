"use client";

import { usePathname } from "next/navigation";
import { AppBottomNav, type BottomNavItem } from "@/components";
import { IconBook, IconHome, IconTasks } from "./_icons";

/** Child bottom nav — الدروس (يمين) · الرئيسية (وسط، أكبر) · مهامي (يسار). */
export function ChildMobileNav() {
  const pathname = usePathname();
  const items: BottomNavItem[] = [
    { id: "lessons", label: "الدروس", href: "/child/lessons", src: "/assets/icons/icon_lessons.png", fallback: <IconBook />, artworkScale: 1.7 },
    { id: "home", label: "الرئيسية", href: "/child", src: "/assets/icons/icon_home.png", fallback: <IconHome />, center: true },
    { id: "tasks", label: "مهامي", href: "/child/tasks", src: "/assets/icons/icon_tasks.png", fallback: <IconTasks /> },
  ];
  const active = items.find((i) => i.href === pathname)?.id ?? "";
  return <AppBottomNav items={items} activeId={active} />;
}
