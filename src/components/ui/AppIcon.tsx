"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AssetImage } from "./AssetImage";

/**
 * Navigation/action icon backed by a brand PNG (`/assets/icons/<name>.png`),
 * falling back to the existing inline SVG until the real asset is dropped in.
 * Fills its parent (the nav sizes the slot), so it's a transparent swap.
 */
export function AppIcon({
  name,
  fallback,
  className,
}: {
  name: string;
  fallback: ReactNode;
  className?: string;
}) {
  return (
    <AssetImage
      src={`/assets/icons/${name}.png`}
      className={cn("size-full object-contain", className)}
      fallback={fallback}
    />
  );
}
