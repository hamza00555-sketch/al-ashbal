/*
  Landing / entry (Phase 01) — /.
  Invitation-first: the main path is «لدي دعوة» (enter the teacher's invitation
  code → /join). Teacher sign-in is a secondary action. Direct role entry is
  kept only as a small local-demo fallback («تجربة محلية»).
*/
import Link from "next/link";
import { JoinByCode } from "./JoinByCode";

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
          لديك دعوة من المعلم؟ أدخل كود الدعوة للبدء بتسجيل عائلتك أو الطالب.
        </p>
      </div>

      <div className="relative flex w-full max-w-[430px] flex-col items-center gap-3">
        {/* Primary path — invitation code */}
        <JoinByCode />

        {/* Secondary — teacher sign-in (real Supabase Auth) */}
        <Link
          href="/teacher/login"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white/8 px-8 text-button font-bold text-cream/85 ring-1 ring-white/10 transition hover:bg-white/12 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
        >
          دخول المعلم
        </Link>

        {/* Secondary — join request (no invitation code: teacher / parent) */}
        <Link
          href="/join/request"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white/8 px-8 text-button font-bold text-cream/85 ring-1 ring-white/10 transition hover:bg-white/12 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
        >
          طلب انضمام
        </Link>

        {/* Tertiary — local demo fallback only */}
        <div className="mt-2 flex flex-col items-center gap-1.5">
          <span className="text-caption text-cream/70">تجربة محلية</span>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-caption text-cream/75">
            <Link href="/child/switch" className="rounded-sm transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft">مبدّل الأطفال</Link>
            <span aria-hidden className="text-cream/25">·</span>
            <Link href="/parent" className="rounded-sm transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft">ولي أمر</Link>
            <span aria-hidden className="text-cream/25">·</span>
            <Link href="/teacher" className="rounded-sm transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft">معلم</Link>
            <span aria-hidden className="text-cream/25">·</span>
            <Link href="/guest" className="rounded-sm transition hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft">ضيف الشرف</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
