"use client";

/**
 * SAFE ordering input (A5.1-R): reorder ONLY with ↑ / ↓ buttons.
 * No drag, no pointer capture, no getBoundingClientRect — nothing that can hang
 * or hijack scroll on mobile.
 */
export function OrderingInput({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  }

  const arrowBtn =
    "inline-flex size-8 items-center justify-center rounded-md bg-surface text-on-dark-muted transition hover:text-on-dark disabled:opacity-30";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-on-dark-muted">رتّب العناصر باستخدام السهمين ↑ و ↓.</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md border border-purple/12 bg-surface-raised p-2"
          >
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-purple/15 text-caption font-bold text-purple-soft">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 break-words text-body">{item}</span>
            <span className="flex shrink-0 flex-col gap-1">
              <button type="button" aria-label="تحريك لأعلى" disabled={i === 0} onClick={() => move(i, i - 1)} className={arrowBtn}>
                ↑
              </button>
              <button type="button" aria-label="تحريك لأسفل" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className={arrowBtn}>
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
