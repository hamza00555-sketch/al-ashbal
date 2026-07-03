/*
  Landing / entry — /.
  Simple public entry: approved users sign in (/login), new users request to
  join (/join/request). The old invitation-code flow stays reachable at /join
  via a small secondary footer link only.
*/
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-6 py-12 text-center">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 size-72 rounded-pill bg-purple/25 blur-3xl lg:size-[28rem]"
      />

      <div className="relative flex max-w-2xl flex-col items-center gap-4">
        <span className="gradient-badge flex size-16 items-center justify-center rounded-pill text-h2 font-extrabold text-on-light shadow-glow lg:size-20">
          ش
        </span>
        <h1 className="text-h1 font-extrabold text-cream lg:text-display">الأشبال</h1>
        <p className="max-w-[340px] text-body text-cream/75 lg:max-w-md">
          منصة متابعة تعليمية للعائلة والمعلم.
        </p>
      </div>

      <div className="relative flex w-full max-w-[430px] flex-col items-center gap-3">
        {/* Primary — sign in (approved teacher / parent) */}
        <Link
          href="/login"
          className="flex min-h-12 w-full items-center justify-center rounded-lg gradient-cta px-8 text-button font-bold text-cream shadow-glow ring-1 ring-white/15 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
        >
          تسجيل الدخول
        </Link>

        {/* Secondary — request to join (no account yet) */}
        <Link
          href="/join/request"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white/8 px-8 text-button font-bold text-cream/85 ring-1 ring-white/10 transition hover:bg-white/12 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
        >
          طلب انضمام
        </Link>

        {/* Tertiary — legacy invitation-code entry (kept, not prominent) */}
        <p className="mt-2 text-caption text-cream/70">
          لديك كود دعوة قديم؟{" "}
          <Link
            href="/join"
            className="font-bold text-cream/85 underline-offset-4 transition hover:text-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
          >
            إدخال كود الدعوة
          </Link>
        </p>
      </div>
    </main>
  );
}
