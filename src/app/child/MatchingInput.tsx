"use client";

import type { MatchPair } from "@/lib/demo/activities";

/**
 * Simple matching: one dropdown per left item to pick its matching right item.
 * This IS the safe fallback (selects, not drawn lines) — fully touch-friendly
 * and never breaks scroll. No drawn connector lines (per task scope).
 */
export function MatchingInput({
  leftItems,
  rightItems,
  value,
  onChange,
}: {
  leftItems: string[];
  rightItems: string[];
  value: MatchPair[];
  onChange: (next: MatchPair[]) => void;
}) {
  function setRight(left: string, right: string) {
    onChange(value.map((p) => (p.left === left ? { ...p, right } : p)));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-on-dark-muted">اختر العنصر المطابق لكل بند.</p>
      {leftItems.map((left) => {
        const current = value.find((p) => p.left === left)?.right ?? "";
        return (
          <div
            key={left}
            className="flex flex-col gap-2 rounded-md border border-white/10 bg-surface-raised p-3 sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="min-w-0 flex-1 break-words text-body font-bold">{left}</span>
            <select
              value={current}
              onChange={(e) => setRight(left, e.target.value)}
              className="min-h-11 rounded-md border border-white/10 bg-surface px-4 text-body text-on-dark outline-none transition focus:border-purple-soft sm:w-48"
            >
              <option value="">— اختر —</option>
              {rightItems.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}
