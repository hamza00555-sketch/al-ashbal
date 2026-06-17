"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AssetImage } from "./AssetImage";

/**
 * Navigation/action icon backed by a brand PNG (`/assets/icons/<name>.png`),
 * falling back to the existing inline SVG until the real asset is dropped in.
 * Fills its PARENT box (the nav/chip sizes the slot). The brand PNGs have a
 * large transparent canvas, so the artwork is enlarged in place with a default
 * `artworkScale` — the parent box never changes size. For standalone icons with
 * their own fixed container, prefer `AppAssetIcon`.
 */
export function AppIcon({
  name,
  fallback,
  className,
  artworkScale = 1.3,
}: {
  name: string;
  fallback: ReactNode;
  className?: string;
  artworkScale?: number;
}) {
  return (
    <AssetImage
      src={`/assets/icons/${name}.png`}
      className={cn("size-full object-contain", className)}
      style={artworkScale !== 1 ? { transform: `scale(${artworkScale})` } : undefined}
      fallback={fallback}
    />
  );
}
