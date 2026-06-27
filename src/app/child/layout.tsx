/*
  Shared shell for all /child/* routes.
  Responsive: mobile-first column (max 430px) on phones, wider (max 1120px) with
  desktop side-nav on larger screens. A top utility bar holds the global demo
  experience switcher + the notifications bell on every child page.
*/
import type { ReactNode } from "react";
import { AppShell, DemoExperienceSwitcher, NotificationBell } from "@/components";
import { getMockUser, getNotificationsForViewer } from "@/lib/data";
import { ChildDesktopNav } from "./ChildDesktopNav";
import { ChildMobileNav } from "./ChildMobileNav";

export default function ChildLayout({ children }: { children: ReactNode }) {
  const viewer = getMockUser("child");
  const seed = getNotificationsForViewer(viewer);
  return (
    <AppShell sidebar={<ChildDesktopNav />} mobileNav={<ChildMobileNav />} ambient="child">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 md:max-w-[1120px]">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher current="child" />
          <NotificationBell userId={viewer.id} seed={seed} />
        </div>
        {children}
      </div>
    </AppShell>
  );
}
