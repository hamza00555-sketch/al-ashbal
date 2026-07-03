/*
  Shared shell for all /parent/* routes.
  REAL parent accounts (Supabase session + profiles.role = 'parent') see the
  minimal account-status page — never the localStorage demo data. Without a
  session, the local demo parent experience renders unchanged (AppShell +
  demo nav + demo stores), so existing demo flows keep working.
*/
import type { ReactNode } from "react";
import { AppShell, DemoExperienceSwitcher, NotificationBell } from "@/components";
import { getMockUser, getNotificationsForViewer } from "@/lib/data";
import { getCurrentUserProfile } from "@/lib/backend/auth";
import { listChildrenForParent } from "@/lib/backend/families";
import { ParentDesktopNav } from "./ParentDesktopNav";
import { ParentMobileNav } from "./ParentMobileNav";
import { ParentAccountStatus } from "./ParentAccountStatus";

// Auth is per-request (cookies) — never prerender /parent with a baked state.
export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  // Fail OPEN to the demo (not to real data): any auth failure just means the
  // localStorage demo renders, which exposes nothing from the backend.
  let profile = null;
  try {
    profile = await getCurrentUserProfile();
  } catch (error) {
    // Never swallow Next's control-flow errors (dynamic bailout, redirects).
    if (error && typeof error === "object" && "digest" in error) throw error;
    profile = null;
  }
  if (profile?.role === "parent") {
    // REAL parent → their Supabase-linked children (RLS-scoped), never demo data.
    const children = await listChildrenForParent().catch(() => []);
    return (
      <ParentAccountStatus
        displayName={profile.display_name}
        linkedChildren={children.map((c) => ({
          id: c.id,
          displayName: c.display_name,
          avatarUrl: c.avatar_url,
        }))}
      />
    );
  }

  const viewer = getMockUser("parent");
  const seed = getNotificationsForViewer(viewer);
  return (
    <AppShell sidebar={<ParentDesktopNav />} mobileNav={<ParentMobileNav />} ambient="parent">
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 md:max-w-[1120px]">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher current="parent" compact />
          <NotificationBell userId={viewer.id} seed={seed} />
        </div>
        {children}
      </div>
    </AppShell>
  );
}
