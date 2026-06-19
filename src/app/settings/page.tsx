/*
  Settings (/settings) — demo profile settings for the local demo auth shell.
  Edits the current demo profile (display name + avatar) only. No backend, no
  real auth, no route protection.
*/
import { AppShell, DemoExperienceSwitcher } from "@/components";
import { SettingsView } from "./SettingsView";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <DemoExperienceSwitcher />
        </div>
        <SettingsView />
      </div>
    </AppShell>
  );
}
