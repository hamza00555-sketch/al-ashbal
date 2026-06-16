"use client";

import { Badge } from "./Badge";
import { AssetImage } from "./AssetImage";

/**
 * Achievement medal: shows a soft-3D medal PNG (`/assets/badges/<assetKey>.png`)
 * when available, otherwise falls back to the current gold text pill — so the
 * progress page keeps working exactly as today until medals are added.
 */
export function BadgeMedal({
  assetKey,
  label,
  size = 56,
}: {
  assetKey?: string;
  label: string;
  size?: number;
}) {
  const text = <Badge tone="gold">{label}</Badge>;
  if (!assetKey) return text;
  return (
    <AssetImage
      src={`/assets/badges/${assetKey}.png`}
      alt={label}
      className="object-contain"
      style={{ width: size, height: size }}
      fallback={text}
    />
  );
}
