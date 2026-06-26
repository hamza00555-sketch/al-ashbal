"use client";

import Link from "next/link";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";
import { cn } from "@/lib/cn";
import {
  DEMO_ROLES,
  ROLE_LABEL,
  setDemoRole,
  useCurrentProfile,
  useCurrentRole,
} from "@/lib/auth/demoSession";

/**
 * Demo-only panel (NOT real auth): shows the current demo profile/role and lets
 * us switch the role for testing. Lives in the style guide so it never disturbs
 * the main role experiences. Switching the role does NOT gate any route.
 */
export function DemoProfilePanel() {
  const profile = useCurrentProfile();
  const role = useCurrentRole();

  return (
    <Card className="flex flex-col gap-4">
      <SectionTitle title="الجلسة التجريبية (Auth Shell)" subtitle="ليست تسجيل دخول حقيقيًا — تجربة الأدوار فقط" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-card-title font-bold break-words">{profile.displayName}</span>
        <Badge tone="purple">{ROLE_LABEL[role]}</Badge>
        <span className="text-caption text-on-dark-muted">id: {profile.id}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-caption text-on-dark-muted">تبديل الدور (demo):</span>
        <div className="flex flex-wrap gap-2">
          {DEMO_ROLES.map((r) => (
            <Button
              key={r}
              variant={r === role ? "primary" : "secondary"}
              size="sm"
              onClick={() => setDemoRole(r)}
            >
              {ROLE_LABEL[r]}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Link
          href="/settings"
          className={cn(
            "inline-flex min-h-9 items-center gap-1 rounded-md bg-surface-raised px-4 py-1 text-caption font-bold text-on-dark ring-1 ring-purple-soft/35 transition hover:bg-purple/8 hover:ring-purple-soft",
          )}
        >
          فتح إعدادات الملف
        </Link>
      </div>

      <p className={cn("text-caption text-on-dark-muted")}>
        هذا shell محلي فقط: لا backend ولا Supabase، ولا يمنع الوصول لأي صفحة.
      </p>
    </Card>
  );
}
