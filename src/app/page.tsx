/*
  Placeholder home route.
  Phase 01 · Task 2 (Design Tokens). Still NOT a real app page — it only
  exercises the new brand tokens (font / color / typography / spacing utilities)
  so the wiring is visible and verified. Real pages come in later tasks.
*/
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-sm px-lg text-center">
      <h1 className="text-display text-purple-soft">الأشبال</h1>
      <p className="text-body text-on-dark-muted">
        تم تجهيز طبقة التصميم — Phase 01 · Task 2 (Design Tokens)
      </p>
    </main>
  );
}
