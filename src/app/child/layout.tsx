/*
  Shared shell for all /child/* routes.
  Responsive: one mobile-first column (max 430px) on phones, a wider container
  (max 1120px) with desktop side navigation on larger screens. Each page lays
  out its own content (single column on mobile, multi-column on desktop).
*/
import type { ReactNode } from "react";
import { AppShell } from "@/components";
import { ChildDesktopNav } from "./ChildDesktopNav";
import { ChildMobileNav } from "./ChildMobileNav";

export default function ChildLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell sidebar={<ChildDesktopNav />} mobileNav={<ChildMobileNav />}>
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6 md:max-w-[1120px]">
        {children}
      </div>
    </AppShell>
  );
}
