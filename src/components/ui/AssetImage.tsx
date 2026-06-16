"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Drop-in asset image with a SAFE fallback. It preloads `src`; only when the
 * file actually loads does it swap in the <img>. Until then (and forever, if the
 * file is missing) it renders `fallback`. This means we can reference brand PNGs
 * that aren't in the repo yet WITHOUT any broken-image icon or layout break —
 * the moment the real file is dropped into /public it upgrades automatically.
 */
export function AssetImage({
  src,
  alt = "",
  className,
  style,
  fallback,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  fallback: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const img = new window.Image();
    img.onload = () => {
      if (active) setLoaded(true);
    };
    img.onerror = () => {
      if (active) setLoaded(false);
    };
    img.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  if (!loaded) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} aria-hidden={alt === "" || undefined} />;
}
