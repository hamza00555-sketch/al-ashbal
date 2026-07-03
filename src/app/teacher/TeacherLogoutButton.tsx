"use client";

/*
  «تسجيل الخروج» — lives in the teacher TOOLS navigation (desktop sidebar
  footer + mobile drawer bottom), not in the dashboard content.
  Signs out of Supabase, wipes the retired demo-gate key, goes to /login.
*/
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
      <path
        d="M15 12H4m0 0 3-3m-3 3 3 3M10 5V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TeacherLogoutButton({ variant }: { variant: "sidebar" | "drawer" }) {
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
    window.location.assign("/login");
  }

  const label = busy ? "جاري الخروج..." : "تسجيل الخروج";

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={logout}
        disabled={busy}
        className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-button text-cream/65 transition hover:bg-white/8 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft disabled:opacity-60"
      >
        <span className="inline-flex size-12 shrink-0 items-center justify-center"><LogoutIcon /></span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-body text-on-dark-muted transition hover:bg-purple/8 hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft disabled:opacity-60"
    >
      <span className="inline-flex size-6 shrink-0 items-center justify-center"><LogoutIcon /></span>
      <span className="flex-1 text-start">{label}</span>
    </button>
  );
}
