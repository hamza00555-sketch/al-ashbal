"use client";

/*
  REAL parent home (Phase 2). Shown to a signed-in approved parent instead of
  the localStorage demo: their SUPABASE-linked children (RLS-scoped, fetched
  by the server layout) + logout. The full parent dashboard (approvals,
  progress) arrives with the submissions migration.
*/
import { useState } from "react";
import { Avatar, Badge, Button, Card } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";
import { ParentRealApprovals, type ParentSubmissionView } from "./ParentRealApprovals";

export interface ParentChildView {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  points: number;
}

export function ParentAccountStatus({
  displayName,
  linkedChildren,
  submissions,
}: {
  displayName: string;
  linkedChildren: ParentChildView[];
  submissions: ParentSubmissionView[];
}) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await getSupabaseBrowserClient().auth.signOut();
    } catch {
      // even if sign-out fails (offline), still leave to the login page
    }
    clearLegacyTeacherSession();
    window.location.assign("/login");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-5 pt-[10vh] pb-10">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Card className="flex flex-col items-center gap-3 text-center">
          <span className="gradient-badge flex size-12 items-center justify-center rounded-pill text-card-title font-extrabold text-on-light shadow-glow">
            ش
          </span>
          <span className="text-h2 text-on-dark">مرحبًا، {displayName}</span>
          <p className="text-body text-on-light-muted">
            حسابك مفعّل. لوحة ولي الأمر الكاملة (الموافقات والمتابعة) قيد التجهيز.
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <span className="text-card-title font-bold text-on-dark">أطفالك</span>
          {linkedChildren.length === 0 ? (
            <p className="text-body text-on-light-muted">
              لا أطفال مرتبطون بعد — استخدم رابط دعوة المعلمة لإضافة أطفالك.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {linkedChildren.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-md bg-purple/5 px-3 py-2 ring-1 ring-purple/10">
                  <Avatar name={c.displayName} size="md" src={c.avatarUrl ?? undefined} />
                  <span className="flex-1 text-body font-bold text-on-dark">{c.displayName}</span>
                  <Badge tone="gold">{c.points} نقطة</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <span className="text-card-title font-bold text-on-dark">تسميعات أطفالك</span>
          <ParentRealApprovals submissions={submissions} />
        </Card>

        <div className="sm:max-w-xs">
          <Button variant="secondary" fullWidth onClick={logout} disabled={busy}>
            {busy ? "جاري الخروج..." : "تسجيل خروج"}
          </Button>
        </div>
      </div>
    </main>
  );
}
