"use client";

/*
  Shown when a SIGNED-IN user opens /teacher without the teacher role — a
  parent account, or a join request still pending / rejected. Standalone
  screen — no dashboard shell, no teacher data.
*/
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";
import type { TeacherDeniedReason } from "./TeacherShellGate";

const DENIED_COPY: Record<Exclude<TeacherDeniedReason, null> | "default", { title: string; body: string }> = {
  pending: {
    title: "طلبك قيد المراجعة",
    body: "طلبك قيد المراجعة. ستتمكن من الدخول بعد الموافقة.",
  },
  rejected: {
    title: "تم رفض طلبك",
    body: "تم رفض طلبك. تواصل مع المسؤول إذا كنت تعتقد أن هناك خطأ.",
  },
  default: {
    title: "هذا الحساب ليس حساب معلم",
    body: "لوحة المعلم متاحة لحسابات المعلمين فقط. سجّل الخروج ثم ادخل بحساب معلم.",
  },
};

export function TeacherAccessDenied({ denied = null }: { denied?: TeacherDeniedReason }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const copy = DENIED_COPY[denied ?? "default"];

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await getSupabaseBrowserClient().auth.signOut();
    } catch {
      // even if sign-out fails (offline), still leave the teacher area
    }
    clearLegacyTeacherSession();
    router.replace("/teacher/login");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Card className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="text-h2 font-extrabold text-on-dark">{copy.title}</span>
        <p className="text-body text-on-dark-muted">{copy.body}</p>
        <div className="w-full sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={logout} disabled={busy}>
            {busy ? "جاري الخروج..." : "تسجيل خروج"}
          </Button>
        </div>
      </Card>
    </main>
  );
}
