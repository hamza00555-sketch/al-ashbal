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
import {
  resetChildOverride,
  setChildOverride,
  useChildDisplayProfile,
} from "@/lib/demo/childProfiles";
import type { Role } from "@/lib/auth/types";

const AVATARS = [
  "/assets/avatars/avatar_teacher_male_01.png",
  "/assets/avatars/avatar_teacher_female_01.png",
  "/assets/avatars/avatar_parent_father_01.png",
  "/assets/avatars/avatar_parent_mother_01.png",
  "/assets/avatars/avatar_child_boy_01.png",
  "/assets/avatars/avatar_child_girl_01.png",
];

const ROLE_HOME: Partial<Record<Role, string>> = {
  teacher: "/teacher",
  parent: "/parent",
  child: "/child",
  guest: "/guest",
};

interface SaveTarget {
  displayName: string;
  avatarUrl?: string;
  save: (name: string, avatar?: string) => void;
  reset: () => void;
}

function SettingsForm({ target, onMessage }: { target: SaveTarget; onMessage: (m: string) => void }) {
  const [name, setName] = useState(target.displayName);
  const [avatar, setAvatar] = useState<string | undefined>(target.avatarUrl);

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
        <Button variant="primary" size="sm" onClick={() => { target.save(name.trim() || target.displayName, avatar); onMessage("تم حفظ التغييرات."); }}>حفظ</Button>
        <Button variant="ghost" size="sm" onClick={() => { target.reset(); onMessage("تمت استعادة هذا الملف إلى الافتراضي."); }}>إعادة هذا الملف للافتراضي</Button>
      </div>
    </>
  );
}

export function SettingsView({ roleParam, childId }: { roleParam?: Role; childId?: string }) {
  const router = useRouter();
  const currentRole = useCurrentRole();
  const role: Role = roleParam ?? currentRole;
  const isChild = role === "child" && !!childId;

  // Both hooks are called unconditionally; only the relevant one is used.
  const roleProfile = useProfileForRole(role);
  const childProfile = useChildDisplayProfile(childId ?? "__none__");

  const [message, setMessage] = useState<string | null>(null);

  const displayName = isChild ? childProfile.displayName : roleProfile.displayName;
  const avatarUrl = isChild ? childProfile.avatarUrl : roleProfile.avatarUrl;

  const target: SaveTarget = {
    displayName,
    avatarUrl,
    save: (name, avatar) =>
      isChild
        ? setChildOverride(childId!, { displayName: name, avatarUrl: avatar })
        : setRoleOverride(role, { displayName: name, avatarUrl: avatar }),
    reset: () => (isChild ? resetChildOverride(childId!) : resetRoleOverride(role)),
  };

  const backHref = ROLE_HOME[role];
  const formKey = `${role}:${childId ?? "-"}:${displayName}:${avatarUrl ?? ""}`;
  const backBtnClass =
    "inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft";

  return (
    <>
      <PageHeader
        eyebrow="إعدادات تجريبية"
        title="الملف الشخصي"
        subtitle={`تعديل ملف: ${ROLE_LABEL[role]} — محلي فقط`}
        leading={<Avatar name={displayName} size="hero" src={avatarUrl} />}
        actions={
          backHref ? (
            <Link href={backHref} className={backBtnClass}>← رجوع</Link>
          ) : (
            <button type="button" onClick={() => router.back()} className={backBtnClass}>← رجوع</button>
          )
        }
      />

      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={displayName} size="lg" src={avatarUrl} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-card-title font-bold break-words">{displayName}</span>
            <span className="flex items-center gap-2 text-caption text-on-dark-muted">
              الدور: <Badge tone="purple">{ROLE_LABEL[role]}</Badge>
            </span>
          </div>
        </div>

        <SettingsForm key={formKey} target={target} onMessage={setMessage} />

        {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        <p className="text-caption text-on-dark-muted">
          إعدادات تجريبية محلية لكل ملف على حدة — لا تسجيل دخول ولا backend. تُحفظ على هذا الجهاز.
        </p>
      </Card>
    </>
  );
}
