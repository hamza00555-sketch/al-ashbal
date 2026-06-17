import { AppIcon, type NavItem } from "@/components";
import { IconHome, IconUsers, IconVideo } from "./_icons";

/** Parent navigation (desktop sidebar). Icons use brand 3D PNGs, with the
 *  inline SVG as a safe fallback. (الموافقات uses icon_record_video — there is
 *  no dedicated approvals asset yet.) */
export const parentNavItems: NavItem[] = [
  { id: "home", label: "الرئيسية", href: "/parent", icon: <AppIcon name="icon_home" fallback={<IconHome />} /> },
  { id: "children", label: "أطفالي", href: "/parent/children", icon: <AppIcon name="icon_children" fallback={<IconUsers />} /> },
  { id: "approvals", label: "الموافقات", href: "/parent/approvals", icon: <AppIcon name="icon_record_video" fallback={<IconVideo />} /> },
];
