"use client";

/*
  Root error boundary — converts any unhandled client/render crash from a
  silent white screen into a clear Arabic message with a retry.
*/
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Safe diagnostic only (name/digest — no values, no secrets).
  console.error(`[app-error] ${error.name}${error.digest ? ` (${error.digest})` : ""}`);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-lg p-6 text-center card-elevated text-on-dark">
        <span className="text-h2 font-extrabold">حدث خطأ غير متوقع</span>
        <p className="text-body text-on-dark-muted">جرّب المحاولة مرة أخرى، وإن تكرر الخطأ حدّث الصفحة.</p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md px-5 py-2.5 font-bold gradient-cta text-cream shadow-glow ring-1 ring-white/15 transition hover:brightness-110"
        >
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
