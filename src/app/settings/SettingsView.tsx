"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Badge, Button, Card, PageHeader, SectionTitle } from "@/components";
import { cn } from "@/lib/cn";
import {
  ROLE_LABEL,
  resetRoleOverride,
  setRoleOverride,
  useCurrentRole,
  useProfileForRole,
} from "@/lib/auth/demoSession";
import type { Profile, Role } from "@/lib/auth/types";

/** The existing avatar set (no uploads — pick from what we have). */
const AVATARS = [
  "/assets/avatars/avatar_teacher_male_01.png",
  "/assets/avatars/avatar_teacher_female_01.png",
  "/assets/avatars/avatar_parent_father_01.png",
  "/assets/avatars/avatar_parent_mother_01.png",
  "/assets/avatars/avatar_child_boy_01.png",
  "/assets/avatars/avatar_child_girl_01.png",
];

/** Home route per role (for the back button). */
const ROLE_HOME: Partial<Record<Role, string>> = {
  teacher: "/teacher",
  parent: "/parent",
  child: "/child",
  guest: "/guest",
};

/** Editable form. Keyed by the resolved profile so it re-inits on change. */
function SettingsForm({ role, profile, onMessage }: { role: Role; profile: Profile; onMessage: (m: string) => void }) {
  const [name, setName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState<string | undefined>(profile.avatarUrl);

  function handleSave() {
    const trimmed = name.trim();
    setRoleOverride(role, { displayName: trimmed || profile.displayName, avatarUrl: avatar });
    onMessage("تم حفظ التغييرات.");
  }
  function handleReset() {
    resetRoleOverride(role);
    onMessage("تمت استعادة هذا الدور إلى الافتراضي.");
  }

  return (
    <>
      <label className="flex flex-col gap-2">
        <span className="text-caption text-on-dark-muted">الاسم الظاهر</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب الاسم الظاهر"
          className="min-h-11 w-full rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
        />
      </label>

      <div className="flex flex-col gap-2">
        <SectionTitle title="اختر أفاتار" />
        <div className="flex flex-wrap gap-3">
          {AVATARS.map((src) => {
            const active = avatar === src;
            return (
              <button
                key={src}
                type="button"
                aria-pressed={active}
                onClick={() => setAvatar(src)}
                className={cn(
                  "rounded-pill p-1 transition",
                  active ? "ring-2 ring-purple-soft" : "ring-1 ring-white/10 hover:ring-white/30",
                )}
              >
                <Avatar name="أفاتار" size="lg" src={src} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={handleSave}>حفظ</Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>إعادة هذا الدور للافتراضي</Button>
      </div>
    </>
  );
}

export function SettingsView({ roleParam }: { roleParam?: Role }) {
  const router = useRouter();
  const currentRole = useCurrentRole();
  // Edit the role from the URL when present, else the current demo role.
  const role: Role = roleParam ?? currentRole;
  const profile = useProfileForRole(role);
  const [message, setMessage] = useState<string | null>(null);

  const backHref = ROLE_HOME[role];
  const formKey = `${role}:${profile.displayName}:${profile.avatarUrl ?? ""}`;

  return (
    <>
      <PageHeader
        eyebrow="إعدادات تجريبية"
        title="الملف الشخصي"
        subtitle={`تعديل ملف: ${ROLE_LABEL[role]} — محلي فقط`}
        leading={<Avatar name={profile.displayName} size="hero" src={profile.avatarUrl} />}
        actions={
          backHref ? (
            <Link
              href={backHref}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft"
            >
              ← رجوع
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft"
            >
              ← رجوع
            </button>
          )
        }
      />

      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={profile.displayName} size="lg" src={profile.avatarUrl} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-card-title font-bold break-words">{profile.displayName}</span>
            <span className="flex items-center gap-2 text-caption text-on-dark-muted">
              الدور: <Badge tone="purple">{ROLE_LABEL[role]}</Badge>
            </span>
          </div>
        </div>

        <SettingsForm key={formKey} role={role} profile={profile} onMessage={setMessage} />

        {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        <p className="text-caption text-on-dark-muted">
          إعدادات تجريبية محلية لكل دور على حدة — لا تسجيل دخول ولا backend. تُحفظ على هذا الجهاز.
        </p>
      </Card>
    </>
  );
}
