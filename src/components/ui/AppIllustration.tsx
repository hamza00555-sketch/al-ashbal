"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AssetImage } from "./AssetImage";

/**
 * Support illustration backed by a brand PNG (`/assets/illustrations/<name>.png`).
 * Falls back to `fallback` (default: nothing) until the real asset is dropped in,
 * so empty states keep working exactly as today.
 */
export function AppIllustration({
  name,
  alt = "",
  className,
  style,
  fallback = null,
}: {
  name: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  fallback?: ReactNode;
}) {
  return (
    <AssetImage
      src={`/assets/illustrations/${name}.png`}
      alt={alt}
      className={cn("object-contain", className)}
      style={style}
      fallback={fallback}
    />
  );
}
