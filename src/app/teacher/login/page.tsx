/*
  Teacher login (/teacher/login) — real Supabase Auth (Phase 2).
  Standalone branded screen (no teacher nav). Email + password only; there is
  NO public signup — accounts come from scripts/bootstrap-teacher.mjs.
*/
import Link from "next/link";
import { TeacherLogin } from "./TeacherLogin";

export default function TeacherLoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 size-72 rounded-pill bg-purple/20 blur-3xl lg:size-[26rem]"
      />
      <div className="relative flex w-full max-w-md flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="gradient-badge flex size-14 items-center justify-center rounded-pill text-h2 font-extrabold text-on-light shadow-glow">
            ش
          </Link>
          <h1 className="text-h1 font-extrabold text-cream">لوحة المعلم</h1>
          <p className="max-w-sm text-body text-cream/75">
            هذه المنطقة مخصّصة للمعلم. سجّل الدخول بحسابك للمتابعة.
          </p>
        </header>

        <TeacherLogin />
      </div>
    </main>
  );
}
