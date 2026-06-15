/*
  Shared shell for all /child/* routes (Phase 01 · Task 5.1).
  Provides one AppShell + bottom nav + the mobile-first container, so each page
  only renders its own content (no duplicated shell code).
*/
import type { ReactNode } from "react";
import { AppShell } from "@/components";
import { ChildMobileNav } from "./ChildMobileNav";

export default function ChildLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell mobileNav={<ChildMobileNav />}>
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-6">{children}</div>
    </AppShell>
  );
}
