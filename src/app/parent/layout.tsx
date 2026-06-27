/*
  Shared shell for all /parent/* routes (Phase 01 · Task 6.3/6.4).
  One AppShell + desktop side-nav + mobile bottom-nav + responsive container.
  A top utility bar holds the global demo experience switcher + notifications
  bell on every parent page.
*/
import type { ReactNode } from "react";
import { AppShell, DemoExperienceSwitcher, NotificationBell } from "@/components";
import { getMockUser, getNotificationsForViewer } from "@/lib/data";
import { ParentDesktopNav } from "./ParentDesktopNav";
import { ParentMobileNav } from "./ParentMobileNav";

export default function ParentLayout({ children }: { children: ReactNode }) {
  const viewer = getMockUser("parent");
  const seed = getNotificationsForViewer(viewer);
  return (
    <AppShell sidebar={<ParentDesktopNav />} mobileNav={<ParentMobileNav />} ambient="parent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 md:max-w-[1120px]">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher current="parent" />
          <NotificationBell userId={viewer.id} seed={seed} />
        </div>
        {children}
      </div>
    </AppShell>
  );
}
