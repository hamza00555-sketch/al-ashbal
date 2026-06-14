/*
  Placeholder home route.
  Phase 01 · Task 1 (Project Setup) only — exists so the app boots and so the
  RTL / Baloo font / brand tokens wiring is visible. The real landing and the
  role-based pages belong to later tasks and are intentionally NOT built here.
*/
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1
        className="text-5xl font-extrabold tracking-tight"
        style={{ color: "var(--color-soft-purple)" }}
      >
        الأشبال
      </h1>
      <p className="text-base" style={{ color: "var(--text-muted-on-dark)" }}>
        تم تجهيز أساس المشروع — Phase 01 · Task 1 (Project Setup)
      </p>
    </main>
  );
}
