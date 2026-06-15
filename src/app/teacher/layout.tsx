/*
  Shared shell for all /teacher/* routes (Phase 01 · Task 7).
  Desktop-first dashboard: one AppShell + desktop side-nav + mobile bottom-nav,
  a wide container, and a top utility bar (demo experience switcher + bell) on
  every teacher page. Each page renders only its own content.
*/
import type { ReactNode } from "react";
import { AppShell, DemoExperienceSwitcher, NotificationBell } from "@/components";
import { getMockUser, getNotificationsForViewer } from "@/lib/data";
import { TeacherDesktopNav } from "./TeacherDesktopNav";
import { TeacherMobileNav } from "./TeacherMobileNav";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const viewer = getMockUser("teacher");
  const seed = getNotificationsForViewer(viewer);
  return (
    <AppShell sidebar={<TeacherDesktopNav />} mobileNav={<TeacherMobileNav />}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher current="teacher" />
          <NotificationBell userId={viewer.id} seed={seed} />
        </div>
        {children}
      </div>
    </AppShell>
  );
}
