"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Reorderable list with TWO ways to reorder, so it never fails on mobile:
 *  1. Pointer-events drag from the handle (works for mouse + touch; the handle
 *     has touch-action:none and we capture the pointer on the list, so dragging
 *     never hijacks page scroll).
 *  2. Always-visible ↑ / ↓ buttons (the reliable fallback).
 * Dependency-free on purpose — see the task notes about install/build safety.
 */
export function OrderingInput({
  items,
  onChange,
}: {
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const listRef = useRef<HTMLUListElement | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  }

  function onPointerDown(e: React.PointerEvent, i: number) {
    listRef.current?.setPointerCapture(e.pointerId);
    setDragIndex(i);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragIndex === null) return;
    const y = e.clientY;
    const rows = rowRefs.current;
    let target = items.length - 1;
    for (let i = 0; i < rows.length; i++) {
      const el = rows[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        target = i;
        break;
      }
    }
    if (target !== dragIndex) {
      move(dragIndex, target);
      setDragIndex(target);
    }
  }

  function endDrag(e: React.PointerEvent) {
    if (dragIndex === null) return;
    try {
      listRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be gone */
    }
    setDragIndex(null);
  }

  const arrowBtn =
    "inline-flex size-7 items-center justify-center rounded-md bg-surface text-on-dark-muted transition hover:text-on-dark disabled:opacity-30";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption text-on-dark-muted">اسحب لترتيب العناصر، أو استخدم الأسهم.</p>
      <ul
        ref={listRef}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="flex flex-col gap-2"
      >
        {items.map((item, i) => (
          <li
            key={i}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className={cn(
              "flex items-center gap-2 rounded-md border bg-surface-raised p-2 transition",
              dragIndex === i ? "border-purple-soft ring-2 ring-purple-soft" : "border-white/10",
            )}
          >
            <span
              role="button"
              tabIndex={0}
              aria-label="اسحب لإعادة الترتيب"
              onPointerDown={(e) => onPointerDown(e, i)}
              className="inline-flex size-8 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md text-on-dark-muted"
            >
              ⠿
            </span>
            <span className="me-2 inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-purple/15 text-caption font-bold text-purple-soft">
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
