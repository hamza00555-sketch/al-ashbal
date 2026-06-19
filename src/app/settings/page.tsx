/*
  Settings (/settings) — demo profile settings for the local demo auth shell.
  Edits the profile of the role passed via ?role= (teacher|parent|child|...),
  defaulting to the current demo role. No backend, no real auth, no protection.
*/
import { AppShell, DemoExperienceSwitcher } from "@/components";
import { getMockUser, getVisibleChildren } from "@/lib/data";
import type { Role } from "@/lib/auth/types";
import { SettingsView } from "./SettingsView";

const VALID_ROLES = ["teacher", "parent", "child", "guest", "admin"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;
  const role = VALID_ROLES.includes(roleParam ?? "") ? (roleParam as Role) : undefined;

  // For the child role, settings edit the child profile keyed by childId (the
  // demo child viewer) so the change reflects in the parent's views too.
  const childId =
    role === "child" ? getVisibleChildren(getMockUser("child"))[0]?.id : undefined;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher />
        </div>
        <SettingsView roleParam={role} childId={childId} />
      </div>
    </AppShell>
  );
}
