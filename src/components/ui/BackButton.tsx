"use client";

/* «رجوع» pill for standalone pages (login / join request) — same look as the
   settings back button. Goes to the previous page; falls back to the home
   page when the tab has no history (link opened directly). */
import { useRouter } from "next/navigation";

export function BackButton({ label = "رجوع" }: { label?: string }) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex min-h-9 shrink-0 items-center gap-1 self-start whitespace-nowrap rounded-pill bg-surface-raised px-3.5 py-1.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-purple/8 hover:ring-purple-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
    >
      ← {label}
    </button>
  );
}
