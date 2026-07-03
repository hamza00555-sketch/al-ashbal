"use client";

/*
  Minimal REAL parent page (Phase: unified login). Shown to a signed-in
  approved parent instead of the localStorage demo. Children are linked in the
  next phase — this only confirms the account is active and offers logout.
*/
import { useState } from "react";
import { Button, Card } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";

export function ParentAccountStatus({ displayName }: { displayName: string }) {
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
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Card className="flex w-full max-w-md flex-col items-center gap-3 text-center">
        <span className="gradient-badge flex size-14 items-center justify-center rounded-pill text-h2 font-extrabold text-on-light shadow-glow">
          ش
        </span>
        <span className="text-h2 font-extrabold text-on-dark">مرحبًا، {displayName}</span>
        <p className="text-body text-on-dark-muted">
          تم تفعيل حساب ولي الأمر. لوحة ولي الأمر قيد التجهيز — سيتم ربط الأطفال في المرحلة التالية.
        </p>
        <div className="w-full sm:max-w-xs">
          <Button variant="secondary" fullWidth onClick={logout} disabled={busy}>
            {busy ? "جاري الخروج..." : "تسجيل خروج"}
          </Button>
        </div>
      </Card>
    </main>
  );
}
