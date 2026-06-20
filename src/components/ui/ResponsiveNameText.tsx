"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const MIN_FONT_PX = 6;

/**
 * Arabic-safe header/card name. NO ellipsis, NO truncation, NO letter-breaking.
 *
 * - Single word (no spaces): rendered on one line (nowrap) and the font size is
 *   reduced to fit the available width so the FULL word stays visible.
 * - Multiple words: wraps naturally; the font shrinks if needed to keep it
 *   within ~2 lines (word-break: keep-all so words never split).
 *
 * Fitting is measured imperatively (no React state, no package) and re-runs on
 * container resize via ResizeObserver. The surrounding header keeps the action
 * button fixed (shrink-0) — this only controls how the name scales.
 */
export function ResponsiveNameText({ name, className }: { name: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const single = !/\s/.test(name.trim());

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    function fit() {
      if (!container || !text) return;
      // Measure at the inherited (base) font size first.
      text.style.fontSize = "";
      const base = parseFloat(getComputedStyle(text).fontSize) || 16;
      let size = base;
      text.style.fontSize = `${size}px`;

      const fits = () => {
        if (single) return text.scrollWidth <= container.clientWidth + 0.5;
        const lh = parseFloat(getComputedStyle(text).lineHeight) || size * 1.25;
        return text.scrollHeight <= lh * 2 + 1; // at most ~2 lines
      };

      let guard = 0;
      while (!fits() && size > MIN_FONT_PX && guard++ < 120) {
        size -= 0.5;
        text.style.fontSize = `${size}px`;
      }
    }

    fit();
    const ro = new ResizeObserver(() => fit());
    ro.observe(container);
    return () => ro.disconnect();
  }, [name, single]);

  return (
    <span ref={containerRef} className={cn("block w-full min-w-0 overflow-hidden", className)}>
      <span
        ref={textRef}
        className={cn(
          "block w-full [word-break:keep-all]",
          single ? "whitespace-nowrap" : "whitespace-normal",
        )}
      >
        {name}
      </span>
    </span>
  );
}
