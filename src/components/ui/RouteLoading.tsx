/*
  Route-level loading state (used by segment loading.tsx files).
  Lightweight: one spinner (border rotation — GPU-cheap, disabled under
  prefers-reduced-motion) + short Arabic copy in a compact brand card at the
  upper third. Renders INSTANTLY on navigation so taps never feel dead while
  a dynamic segment does its server work.
*/
export function RouteLoading({ label = "جاري التحميل..." }: { label?: string }) {
  return (
    <main className="flex min-h-dvh flex-col items-center px-5 pt-[18vh] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-lg p-6 text-center card-elevated text-on-dark">
        <span
          aria-hidden
          className="inline-block size-8 rounded-pill border-[3px] border-purple/20 border-t-purple motion-safe:animate-spin"
        />
        <p role="status" className="text-body font-bold text-on-dark">
          {label}
        </p>
      </div>
    </main>
  );
}
