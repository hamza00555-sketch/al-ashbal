"use client";

/*
  Shown when a SIGNED-IN user opens /teacher without the teacher role (e.g. a
  parent account). Standalone screen — no dashboard shell, no teacher data.
*/
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";

export function TeacherAccessDenied() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
        <span className="text-h2 font-extrabold text-on-dark">هذا الحساب ليس حساب معلم</span>
        <p className="text-body text-on-dark-muted">
          لوحة المعلم متاحة لحسابات المعلمين فقط. سجّل الخروج ثم ادخل بحساب معلم.
        </p>
        <div className="w-full sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={logout} disabled={busy}>
            {busy ? "جاري الخروج..." : "تسجيل خروج"}
          </Button>
        </div>
      </Card>
    </main>
  );
}
