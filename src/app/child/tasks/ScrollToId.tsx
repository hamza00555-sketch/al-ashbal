"use client";

import { useEffect } from "react";

/** Smoothly scrolls the element with the given DOM id into view once on mount. */
export function ScrollToId({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [targetId]);
  return null;
}
