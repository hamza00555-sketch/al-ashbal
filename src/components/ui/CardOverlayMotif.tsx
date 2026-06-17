import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * TEMPORARY flat inline-SVG decorative watermark overlays for cream contrast
 * cards — placeholders until the final flat overlay PNGs are generated.
 * Decorative only: flat, minimal, curvy, no 3D/shadow/glow. Used behind card
 * content at very low opacity (set via className, e.g. `opacity-[0.12]`).
 */
export type OverlayMotif = "wishes" | "progress" | "badge" | "halo";

const SHAPES: Record<OverlayMotif, ReactNode> = {
  // Soft curvy 4-point wish star + 2 tiny sparkles.
  wishes: (
    <svg viewBox="0 0 100 100" fill="currentColor" className="size-full">
      <path d="M50 10c4 14 10 26 40 30-30 4-36 16-40 40-4-24-10-36-40-40 30-4 36-16 40-40z" />
      <circle cx="22" cy="20" r="3.5" />
      <circle cx="82" cy="26" r="2.5" />
    </svg>
  ),
  // Open thick curved progress ring (~75%).
  progress: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" className="size-full">
      <path d="M50 14 A36 36 0 1 1 18 34" />
    </svg>
  ),
  // Simple medal silhouette: round medallion + small ribbon.
  badge: (
    <svg viewBox="0 0 100 100" fill="currentColor" className="size-full">
      <circle cx="50" cy="40" r="28" />
      <path d="M40 64 L33 90 L50 80 L67 90 L60 64 Z" />
    </svg>
  ),
  // Flat halo: thin ring + 4 dots, empty center.
  halo: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" className="size-full">
      <circle cx="50" cy="50" r="33" />
      <g fill="currentColor" stroke="none">
        <circle cx="50" cy="11" r="3.5" />
        <circle cx="89" cy="50" r="3" />
        <circle cx="50" cy="89" r="3.5" />
        <circle cx="11" cy="50" r="3" />
      </g>
    </svg>
  ),
};

export function CardOverlayMotif({ motif, className }: { motif: OverlayMotif; className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute select-none", className)}>
      {SHAPES[motif]}
    </span>
  );
}
