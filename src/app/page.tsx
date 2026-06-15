/*
  Landing / entry (Phase 01) — /.
  A simple, presentable brand entry. The component showcase now lives at
  /style-guide (developer-only). Mostly purple; white/cream kept to the CTA
  and the brand mark.
*/
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-6 text-center">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 size-72 rounded-pill bg-purple/25 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-4">
        <span className="gradient-badge flex size-16 items-center justify-center rounded-pill text-h2 font-extrabold text-on-light shadow-glow">
          ش
        </span>
        <h1 className="text-h1 text-cream">الأشبال</h1>
        <p className="max-w-[320px] text-body text-on-dark-muted">
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
          href="/style-guide"
          className="text-caption text-on-dark-muted transition hover:text-on-dark"
        >
          معرض المكوّنات (للمطوّرين)
        </Link>
      </div>
    </main>
  );
}
