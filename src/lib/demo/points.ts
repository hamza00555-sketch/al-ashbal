"use client";

/*
  الأشبال — client-side demo points store (Phase 01 · Task A6).
  PROTOTYPE ONLY: a teacher quickly rewards a child (or flags follow-up); points
  surface on the child's progress page and the parent's child detail. localStorage
  only — no backend, no mock-db writes, no scoring engine, no leaderboard.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ChildStatusLevel } from "@/lib/data";

export type PointCategory =
  | "participation"
  | "recitation"
  | "behavior"
  | "improvement"
  | "attendance"
  | "needs_follow_up"
  | "activity";

/** Where a points entry came from (used to prevent duplicates). Optional for
 *  backward-compatibility with A6 entries that have neither field. */
export type PointSourceType = "manual" | "recitation" | "activity";

export interface PointEntry {
  pointId: string;
  childId: string;
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  value: number;
  reason: string;
  category: PointCategory;
  note?: string;
  createdAt: string;
  sourceType?: PointSourceType;
  sourceId?: string;
}

export const POINT_CATEGORY_LABEL: Record<PointCategory, string> = {
  participation: "مشاركة",
  recitation: "تسميع",
  behavior: "التزام",
  improvement: "تحسّن",
  attendance: "حضور",
  needs_follow_up: "يحتاج متابعة",
  activity: "نشاط",
};

/** Quick presets shown in the "add points" sheet. */
export interface PointPreset {
  label: string;
  value: number;
  category: PointCategory;
  reason: string;
}
export const POINT_PRESETS: PointPreset[] = [
  { label: "+1 مشاركة", value: 1, category: "participation", reason: "مشاركة" },
  { label: "+2 تسميع ممتاز", value: 2, category: "recitation", reason: "تسميع ممتاز" },
  { label: "+1 التزام", value: 1, category: "behavior", reason: "التزام" },
  { label: "+1 تحسّن", value: 1, category: "improvement", reason: "تحسّن" },
  { label: "-1 يحتاج متابعة", value: -1, category: "needs_follow_up", reason: "يحتاج متابعة" },
];

const KEY = "alashbal:points";
const EVENT = "alashbal:points-changed";
const EMPTY: PointEntry[] = [];

function readAll(): PointEntry[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PointEntry[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: PointEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
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

function newId(): string {
  return `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Demo reset: clears ONLY the points store. */
export function resetPoints() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Add a points entry (newest first). Used by the manual quick-add sheet. */
export function addPoints(entry: Omit<PointEntry, "pointId" | "createdAt">): PointEntry {
  const item: PointEntry = { ...entry, pointId: newId(), createdAt: new Date().toISOString() };
  writeAll([item, ...readAll()]);
  return item;
}

/**
 * Add OR replace a points entry tied to a source (recitation submission /
 * activity). Prevents duplicates: re-accepting the same recitation or
 * re-submitting the same activity updates the single entry instead of stacking.
 * A value <= 0 removes any existing source entry (and adds nothing).
 */
export function recordSourcedPoints(
  entry: Omit<PointEntry, "pointId" | "createdAt"> & { sourceType: PointSourceType; sourceId: string },
): PointEntry | null {
  const list = readAll();
  const idx = list.findIndex(
    (p) => p.childId === entry.childId && p.sourceType === entry.sourceType && p.sourceId === entry.sourceId,
  );
  if (entry.value <= 0) {
    if (idx >= 0) writeAll(list.filter((_, i) => i !== idx));
    return null;
  }
  const item: PointEntry = {
    ...entry,
    pointId: idx >= 0 ? list[idx].pointId : newId(),
    createdAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    const next = [...list];
    next[idx] = item;
    writeAll(next);
  } else {
    writeAll([item, ...list]);
  }
  return item;
}

/** All point entries for a child (newest first). Module-level (read-only). */
export function getPointsForChild(childId: string): PointEntry[] {
  return readAll()
    .filter((p) => p.childId === childId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface PointSummary {
  total: number;
  count: number;
  recent: PointEntry[]; // newest first, up to 3
  hasNeedsFollowUp: boolean;
  hasNegative: boolean;
}

/** Compact summary used by the UI + the status helper. */
export function getPointSummaryForChild(childId: string): PointSummary {
  const list = getPointsForChild(childId);
  const total = list.reduce((sum, p) => sum + p.value, 0);
  return {
    total,
    count: list.length,
    recent: list.slice(0, 3),
    hasNeedsFollowUp: list.some((p) => p.category === "needs_follow_up"),
    hasNegative: list.some((p) => p.value < 0),
  };
}

/**
 * Gentle, opt-in effect of points on the base status (kept separate so it never
 * breaks the core status calculation, and is easy to tweak later):
 *  - a needs_follow_up / negative point nudges an "excellent" child to follow_up.
 *  - a healthy positive balance can lift a follow_up child to excellent.
 * It never makes a status worse than "follow_up", nor overrides "intervene".
 */
export function pointsAdjustedLevel(base: ChildStatusLevel, summary: PointSummary): ChildStatusLevel {
  if (summary.hasNeedsFollowUp || summary.hasNegative) {
    return base === "excellent" ? "follow_up" : base;
  }
  if (summary.total >= 5 && base === "follow_up") return "excellent";
  return base;
}

function usePoints(filter: (p: PointEntry) => boolean, sig: string): PointEntry[] {
  const cache = useRef<{ sig: string; value: PointEntry[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): PointEntry[] => {
    const list = readAll()
      .filter(filter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const signature = `${sig}:${JSON.stringify(list)}`;
    if (signature === cache.current.sig) return cache.current.value;
    cache.current = { sig: signature, value: list };
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function usePointsForChild(childId: string): PointEntry[] {
  return usePoints((p) => p.childId === childId, `child:${childId}`);
}

export function usePointsForHalaqa(halaqaId: string): PointEntry[] {
  return usePoints((p) => p.halaqaId === halaqaId, `halaqa:${halaqaId}`);
}
