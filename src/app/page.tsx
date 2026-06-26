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
        <h1 className="text-h1 font-extrabold text-purple lg:text-display">الأشبال</h1>
        <p className="max-w-[320px] text-body text-on-dark-muted lg:max-w-md">
          رحلة الشبل في القرآن والتجويد والسلوك — بمتابعة آمنة ومحفّزة.
        </p>
      </div>

      <div className="relative flex w-full max-w-[430px] flex-col items-center gap-3">
        <Link
          href="/child"
          className="gradient-cta flex min-h-12 w-full items-center justify-center rounded-lg px-8 text-button font-bold text-cream shadow-glow transition hover:brightness-110"
        >
          ادخل تجربة الطفل
        </Link>
        <Link
          href="/parent"
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-purple/12 bg-surface-raised px-8 text-button font-bold text-on-dark transition hover:bg-purple/8"
        >
          تجربة ولي الأمر
        </Link>
        <Link
          href="/teacher"
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-purple/12 bg-surface-raised px-8 text-button font-bold text-on-dark transition hover:bg-purple/8"
        >
          لوحة المعلم
        </Link>
        <Link
          href="/guest"
          className="flex min-h-11 w-full items-center justify-center rounded-lg border border-purple/12 bg-surface-raised px-8 text-button font-bold text-on-dark transition hover:bg-purple/8"
        >
          ضيف الشرف
        </Link>
        <Link
          href="/style-guide"
          className="text-caption text-on-dark-muted transition hover:text-on-dark"
        >
          دليل التصميم / معرض المكوّنات
        </Link>
      </div>
    </main>
  );
}
