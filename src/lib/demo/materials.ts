"use client";

/*
  الأشبال — DEMO learning-materials store (Phase A of the Materials system).

  A "material" is the teaching unit that shows as a progress ring on
  /child/progress (القرآن / التجويد / السلوك / …). For now there is NO teacher
  UI to manage materials — every halaqa falls back to three default demo
  materials. The store is localStorage-backed (same pattern as the other demo
  stores) so a later phase (teacher materials manager) can write to it without
  touching this file's readers.

  Visual assets: materials reuse the EXISTING icon_* set and the existing color
  tokens only — no new images are introduced.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { PointCategory } from "./points";

export type MaterialType =
  | "quran"
  | "tajweed"
  | "behavior"
  | "hadith"
  | "adhkar"
  | "adab"
  | "custom";

/** Color token must match ProgressRing's tone palette (no new colors). */
export type MaterialColorToken = "purple" | "gold" | "success";

export interface LearningMaterial {
  id: string;
  halaqaId: string;
  name: string;
  type: MaterialType;
  iconKey: string; // an existing /assets/icons/icon_*.png key
  colorToken: MaterialColorToken;
  showInChildProgress: boolean;
  targetPoints: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fallback for LEGACY points that have no materialId yet: map the point's
 * category to a material type, so old data still counts toward a ring.
 */
export const FALLBACK_CATEGORY_TO_TYPE: Record<PointCategory, MaterialType> = {
  recitation: "quran",
  behavior: "behavior",
  attendance: "behavior",
  participation: "behavior",
  needs_follow_up: "behavior",
  improvement: "behavior",
  activity: "tajweed",
};

const TS = "2026-01-01T00:00:00.000Z";

/** The three default demo materials every halaqa starts with. */
export function defaultMaterials(halaqaId: string): LearningMaterial[] {
  return [
    { id: `mat-${halaqaId}-quran`, halaqaId, name: "القرآن", type: "quran", iconKey: "icon_review", colorToken: "purple", showInChildProgress: true, targetPoints: 20, order: 1, createdAt: TS, updatedAt: TS },
    { id: `mat-${halaqaId}-tajweed`, halaqaId, name: "التجويد", type: "tajweed", iconKey: "icon_lessons", colorToken: "gold", showInChildProgress: true, targetPoints: 20, order: 2, createdAt: TS, updatedAt: TS },
    { id: `mat-${halaqaId}-behavior`, halaqaId, name: "السلوك", type: "behavior", iconKey: "icon_activity", colorToken: "success", showInChildProgress: true, targetPoints: 20, order: 3, createdAt: TS, updatedAt: TS },
  ];
}

const KEY = "alashbal:materials";
const EVENT = "alashbal:materials-changed";
const EMPTY: LearningMaterial[] = [];

function readAll(): LearningMaterial[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LearningMaterial[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Materials for a halaqa, ordered. If none are stored yet, the default demo
 * materials are returned — so the child always sees rings even with empty
 * localStorage.
 */
export function getMaterialsForHalaqa(halaqaId: string): LearningMaterial[] {
  const stored = readAll().filter((m) => m.halaqaId === halaqaId);
  const list = stored.length > 0 ? stored : defaultMaterials(halaqaId);
  return [...list].sort((a, b) => a.order - b.order);
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Stable defaults per halaqa for the server/hydration snapshot (must not read
// localStorage and must keep a stable reference).
const defaultsCache = new Map<string, LearningMaterial[]>();
function stableDefaults(halaqaId: string): LearningMaterial[] {
  let v = defaultsCache.get(halaqaId);
  if (!v) {
    v = defaultMaterials(halaqaId);
    defaultsCache.set(halaqaId, v);
  }
  return v;
}

/** Reactive list of a halaqa's materials (defaults when empty). */
export function useMaterialsForHalaqa(halaqaId: string): LearningMaterial[] {
  const cache = useRef<{ sig: string; value: LearningMaterial[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): LearningMaterial[] => {
    const list = getMaterialsForHalaqa(halaqaId);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [halaqaId]);
  const getServerSnapshot = useCallback(() => stableDefaults(halaqaId), [halaqaId]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
