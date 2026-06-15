/*
  Shared shell for all /parent/* routes (Phase 01 · Task 6.3).
  One AppShell + desktop side-nav + mobile bottom-nav + the responsive container,
  so each parent page only renders its own content (no duplicated shell code).
*/
import type { ReactNode } from "react";
import { AppShell } from "@/components";
import { ParentDesktopNav } from "./ParentDesktopNav";
import { ParentMobileNav } from "./ParentMobileNav";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell sidebar={<ParentDesktopNav />} mobileNav={<ParentMobileNav />}>
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-[1120px]">
        {children}
      </div>
    </AppShell>
  );
}
