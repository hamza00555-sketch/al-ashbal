/*
  Landing / entry (Phase 01) — /.
  A simple, responsive brand entry: centered hero that scales up on larger
  screens (not a phone-width frame). Mostly purple; white/cream kept to the CTA
  and the brand mark. The component showcase lives at /style-guide.
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
        <p className="max-w-[320px] text-body text-cream/75 lg:max-w-md">
          اختر دورك للبدء — طالب أو ولي أمر.
        </p>
      </div>

      <div className="relative flex w-full max-w-[430px] flex-col items-center gap-3">
        <Link
          href="/child/start"
          className="gradient-cta flex min-h-12 w-full items-center justify-center rounded-lg px-8 text-button font-bold text-cream shadow-glow transition hover:brightness-110"
        >
          تسجيل / دخول كطالب
        </Link>
        <Link
          href="/parent"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-surface-raised px-8 text-button font-bold text-on-dark ring-1 ring-purple/12 transition hover:bg-purple/8"
        >
          تسجيل / دخول كولي أمر
        </Link>
        <Link
          href="/teacher"
          className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white/8 px-8 text-button font-bold text-cream/80 ring-1 ring-white/10 transition hover:bg-white/12 hover:text-cream"
        >
          لوحة المعلم
        </Link>
        <Link
          href="/guest"
          className="text-caption text-cream/55 transition hover:text-cream"
        >
          ضيف الشرف · دليل التصميم
        </Link>
      </div>
    </main>
  );
}
