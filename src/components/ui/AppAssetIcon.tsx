"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AssetImage } from "./AssetImage";

/**
 * Unified asset-icon renderer.
 *
 * The brand PNGs have a large transparent canvas (~50–65% fill), so a raw
 * <img> looks small. This component keeps the CONTAINER at a fixed preset size
 * and enlarges only the artwork (object-contain + a transform scale) — the box
 * never grows, so layouts stay stable and nothing stretches.
 *
 * - `size`     : fixed container preset (sm / md / lg / nav / hero).
 * - `variant`  : optional surface around the icon (plain / nav / circle / soft / floating).
 * - `artworkScale` : override the default per-size scale for icons that read small.
 */
export type AssetIconSize = "sm" | "md" | "lg" | "nav" | "hero";
export type AssetIconVariant = "plain" | "nav" | "circle" | "soft" | "floating";

// container box + default artwork scale (counters the transparent canvas).
const SIZE: Record<AssetIconSize, { box: string; scale: number }> = {
  sm: { box: "size-8", scale: 1.3 }, // 32px container · ~24px artwork
  md: { box: "size-11", scale: 1.35 }, // 44px · ~34px
  lg: { box: "size-16", scale: 1.3 }, // 64px · ~48px
  nav: { box: "size-12", scale: 1.35 }, // 48px · ~36px
  hero: { box: "size-18", scale: 1.3 }, // 72px · ~52px
};

const VARIANT: Record<AssetIconVariant, string> = {
  plain: "overflow-visible",
  nav: "overflow-visible",
  circle: "overflow-hidden rounded-full bg-surface-raised ring-1 ring-purple-soft/25",
  soft: "overflow-hidden rounded-2xl bg-purple/15",
  floating:
    "overflow-visible rounded-full bg-surface-raised ring-4 ring-surface shadow-[0_8px_20px_-6px_rgba(123,63,242,0.55)]",
};

export interface AppAssetIconProps {
  src: string;
  alt?: string;
  size?: AssetIconSize;
  variant?: AssetIconVariant;
  /** Override the per-size default scale (e.g. 1.6 for an icon with extra margin). */
  artworkScale?: number;
  className?: string;
  /** Shown until the PNG loads / if it is missing (e.g. an inline SVG). */
  fallback?: ReactNode;
}

export function AppAssetIcon({
  src,
  alt = "",
  size = "md",
  variant = "plain",
  artworkScale,
  className,
  fallback = null,
}: AppAssetIconProps) {
  const preset = SIZE[size];
  const scale = artworkScale ?? preset.scale;
  const style: CSSProperties | undefined = scale !== 1 ? { transform: `scale(${scale})` } : undefined;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", preset.box, VARIANT[variant], className)}
    >
      <AssetImage src={src} alt={alt} className="size-full object-contain" style={style} fallback={fallback} />
    </span>
  );
}
