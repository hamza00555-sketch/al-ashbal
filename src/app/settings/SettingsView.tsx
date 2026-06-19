"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, PageHeader, SectionTitle } from "@/components";
import { cn } from "@/lib/cn";
import {
  ROLE_LABEL,
  resetDemoSession,
  setDemoProfile,
  useCurrentProfile,
  useCurrentRole,
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

/** Editable form. Keyed by the current profile so it re-inits on change. */
function SettingsForm({ profile, onMessage }: { profile: Profile; onMessage: (m: string) => void }) {
  const [name, setName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState<string | undefined>(profile.avatarUrl);

  function handleSave() {
    const trimmed = name.trim();
    setDemoProfile({ displayName: trimmed || profile.displayName, avatarUrl: avatar });
    onMessage("تم حفظ التغييرات.");
  }
  function handleReset() {
    resetDemoSession();
    onMessage("تمت الاستعادة إلى الافتراضي.");
  }

  return (
    <>
      <label className="flex flex-col gap-2">
        <span className="text-caption text-on-dark-muted">الاسم الظاهر</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك الظاهر"
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
        <Button variant="ghost" size="sm" onClick={handleReset}>إعادة للافتراضي</Button>
      </div>
    </>
  );
}

export function SettingsView() {
  const profile = useCurrentProfile();
  const role: Role = useCurrentRole();
  const [message, setMessage] = useState<string | null>(null);

  // Inner form remounts (fresh draft) whenever the saved profile changes.
  const formKey = `${profile.id}:${profile.displayName}:${profile.avatarUrl ?? ""}`;

  return (
    <>
      <PageHeader
        eyebrow="إعدادات تجريبية"
        title="الملف الشخصي"
        subtitle="تعديل بسيط للاسم والأفاتار — محلي فقط"
        leading={<Avatar name={profile.displayName} size="hero" src={profile.avatarUrl} />}
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

        <SettingsForm key={formKey} profile={profile} onMessage={setMessage} />

        {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        <p className="text-caption text-on-dark-muted">
          إعدادات تجريبية محلية فقط — لا تسجيل دخول ولا backend. تُحفظ في جلسة العرض على هذا الجهاز.
        </p>
      </Card>
    </>
  );
}
