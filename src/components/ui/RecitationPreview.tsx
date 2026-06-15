import { cn } from "@/lib/cn";

/**
 * Mock recitation preview (no real video/upload, no assets). A purple video
 * card with a play glyph, a simple CSS sound-wave, and a fake duration — so
 * parents/teachers understand they're reviewing a recitation.
 */
export function RecitationPreview({
  duration = "00:42",
  className,
}: {
  duration?: string;
  className?: string;
}) {
  const bars = [10, 18, 26, 16, 22, 12, 20, 14];
  return (
    <div
      className={cn(
        "relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-md gradient-card",
        className,
      )}
      role="img"
      aria-label="معاينة تسميع تجريبية"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-pill bg-white/10 text-on-dark shadow-glow">
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <div className="flex h-7 items-end gap-1" aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-pill bg-purple-soft animate-pulse"
            style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <span className="text-caption text-on-dark-muted">معاينة تسميع تجريبية · {duration}</span>
    </div>
  );
}
