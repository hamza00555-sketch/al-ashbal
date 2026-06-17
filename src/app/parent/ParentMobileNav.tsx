"use client";

import { usePathname } from "next/navigation";
import { AppBottomNav, type BottomNavItem } from "@/components";
import { IconHome, IconUsers, IconVideo } from "./_icons";

/** Parent bottom nav (mobile) — أطفالي · الرئيسية (وسط) · الموافقات.
 *  No icon_approvals asset exists yet, so approvals uses icon_record_video. */
export function ParentMobileNav() {
  const pathname = usePathname();
  const items: BottomNavItem[] = [
    { id: "children", label: "أطفالي", href: "/parent/children", src: "/assets/icons/icon_children.png", fallback: <IconUsers /> },
    { id: "home", label: "الرئيسية", href: "/parent", src: "/assets/icons/icon_home.png", fallback: <IconHome />, center: true },
    { id: "approvals", label: "الموافقات", href: "/parent/approvals", src: "/assets/icons/icon_record_video.png", fallback: <IconVideo /> },
  ];
  const active = items.find((i) => i.href === pathname)?.id ?? "";
  return <AppBottomNav items={items} activeId={active} />;
}
