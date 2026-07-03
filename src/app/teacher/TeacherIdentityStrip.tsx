"use client";

/* Small "logged in as teacher" strip + calm logout (Phase 2 — real Supabase Auth).
   The identity comes from the server-verified TeacherIdentityProvider; logout
   signs out of Supabase AND wipes the retired demo-gate localStorage key. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";
import { useTeacherIdentity } from "./TeacherIdentity";

export function TeacherIdentityStrip() {
  const router = useRouter();
  const teacher = useTeacherIdentity();
  const [busy, setBusy] = useState(false);
  if (!teacher) return null;

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await getSupabaseBrowserClient().auth.signOut();
    } catch {
      // even if sign-out fails (offline), still leave the teacher area
    }
    clearLegacyTeacherSession();
    router.replace("/login");
    router.refresh();
  }

  return (
    <Card variant="lavender" className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <span className="text-caption text-on-dark-muted">
        مسجل كمعلم: <span className="font-bold text-on-dark">{teacher.displayName}</span>
      </span>
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className="text-caption font-bold text-purple-soft underline-offset-4 transition hover:text-purple hover:underline disabled:opacity-60"
      >
        {busy ? "جاري الخروج..." : "تسجيل خروج"}
      </button>
    </Card>
  );
}
