"use client";

/*
  الأشبال — DEMO learning-materials store.

  A "material" is the teaching unit that shows as a progress ring on
  /child/progress (القرآن / التجويد / السلوك / …). Phase A introduced the store
  + default materials. Phase B adds the teacher manager mutations (add / edit /
  reorder / show-hide / archive). Archiving (NOT deleting) keeps the data.

  Visual assets: materials reuse the EXISTING icon_* set and the existing color
  tokens only — no new images are introduced. localStorage only, no backend.
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
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MATERIAL_TYPE_LABEL: Record<MaterialType, string> = {
  quran: "القرآن",
  tajweed: "التجويد",
  behavior: "السلوك",
  hadith: "الحديث",
  adhkar: "الأذكار",
  adab: "الآداب",
  custom: "مخصص",
};

/** Default name + (existing) icon + (existing) color per type. */
export const MATERIAL_TYPE_DEFAULTS: Record<
  MaterialType,
  { name: string; iconKey: string; colorToken: MaterialColorToken }
> = {
  quran: { name: "القرآن", iconKey: "icon_review", colorToken: "purple" },
  tajweed: { name: "التجويد", iconKey: "icon_lessons", colorToken: "gold" },
  behavior: { name: "السلوك", iconKey: "icon_activity", colorToken: "success" },
  hadith: { name: "الحديث", iconKey: "icon_review", colorToken: "purple" },
  adhkar: { name: "الأذكار", iconKey: "icon_wishes", colorToken: "gold" },
  adab: { name: "الآداب", iconKey: "icon_activity", colorToken: "success" },
  custom: { name: "مادة", iconKey: "icon_tasks", colorToken: "purple" },
};

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
    { id: `mat-${halaqaId}-quran`, halaqaId, name: "القرآن", type: "quran", iconKey: "icon_review", colorToken: "purple", showInChildProgress: true, targetPoints: 20, order: 1, archived: false, createdAt: TS, updatedAt: TS },
    { id: `mat-${halaqaId}-tajweed`, halaqaId, name: "التجويد", type: "tajweed", iconKey: "icon_lessons", colorToken: "gold", showInChildProgress: true, targetPoints: 20, order: 2, archived: false, createdAt: TS, updatedAt: TS },
    { id: `mat-${halaqaId}-behavior`, halaqaId, name: "السلوك", type: "behavior", iconKey: "icon_activity", colorToken: "success", showInChildProgress: true, targetPoints: 20, order: 3, archived: false, createdAt: TS, updatedAt: TS },
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

function writeAll(list: LearningMaterial[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Stored materials for a halaqa, materialized from defaults the first time. */
function halaqaMaterials(all: LearningMaterial[], halaqaId: string): LearningMaterial[] {
  const mine = all.filter((m) => m.halaqaId === halaqaId);
  return mine.length > 0 ? mine : defaultMaterials(halaqaId);
}

/**
 * Apply a change to ONE halaqa's materials (seeding the defaults into storage
 * the first time it is touched), leaving other halaqas untouched.
 */
function mutateHalaqa(halaqaId: string, fn: (items: LearningMaterial[]) => LearningMaterial[]) {
  const all = readAll();
  const others = all.filter((m) => m.halaqaId !== halaqaId);
  const mine = halaqaMaterials(all, halaqaId).map((m) => ({ ...m }));
  writeAll([...others, ...fn(mine)]);
}

/** Active (non-archived) materials for a halaqa, ordered. Used by /child/progress. */
export function getMaterialsForHalaqa(halaqaId: string): LearningMaterial[] {
  return halaqaMaterials(readAll(), halaqaId)
    .filter((m) => !m.archived)
    .sort((a, b) => a.order - b.order);
}

/** ALL materials for a halaqa incl. archived, ordered. Used by the manager. */
export function getAllMaterialsForHalaqa(halaqaId: string): LearningMaterial[] {
  return [...halaqaMaterials(readAll(), halaqaId)].sort((a, b) => a.order - b.order);
}

/** Visible = active AND shown in child progress, ordered. */
export function getVisibleMaterials(halaqaId: string): LearningMaterial[] {
  return getMaterialsForHalaqa(halaqaId).filter((m) => m.showInChildProgress);
}

// ---- mutations (teacher manager) -------------------------------------------

export interface NewMaterialInput {
  name: string;
  type: MaterialType;
  targetPoints: number;
  showInChildProgress: boolean;
}

export function addMaterial(halaqaId: string, input: NewMaterialInput): void {
  mutateHalaqa(halaqaId, (items) => {
    const def = MATERIAL_TYPE_DEFAULTS[input.type];
    const maxOrder = items.reduce((m, x) => Math.max(m, x.order), 0);
    const now = new Date().toISOString();
    const material: LearningMaterial = {
      id: `mat-${halaqaId}-${Date.now()}`,
      halaqaId,
      name: input.name.trim() || def.name,
      type: input.type,
      iconKey: def.iconKey,
      colorToken: def.colorToken,
      showInChildProgress: input.showInChildProgress,
      targetPoints: Math.max(1, Math.round(input.targetPoints) || 1),
      order: maxOrder + 1,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    return [...items, material];
  });
}

export type MaterialPatch = Partial<
  Pick<LearningMaterial, "name" | "targetPoints" | "showInChildProgress" | "type">
>;

export function updateMaterial(halaqaId: string, id: string, patch: MaterialPatch): void {
  mutateHalaqa(halaqaId, (items) =>
    items.map((m) => {
      if (m.id !== id) return m;
      const next: LearningMaterial = { ...m, ...patch, updatedAt: new Date().toISOString() };
      if (patch.name !== undefined) next.name = patch.name.trim() || m.name;
      if (patch.targetPoints !== undefined) next.targetPoints = Math.max(1, Math.round(patch.targetPoints) || 1);
      // When the type changes, refresh icon + color to the new type's defaults.
      if (patch.type !== undefined && patch.type !== m.type) {
        const def = MATERIAL_TYPE_DEFAULTS[patch.type];
        next.iconKey = def.iconKey;
        next.colorToken = def.colorToken;
      }
      return next;
    }),
  );
}

export function setMaterialVisibility(halaqaId: string, id: string, show: boolean): void {
  updateMaterial(halaqaId, id, { showInChildProgress: show });
}

export function setMaterialArchived(halaqaId: string, id: string, archived: boolean): void {
  mutateHalaqa(halaqaId, (items) =>
    items.map((m) => (m.id === id ? { ...m, archived, updatedAt: new Date().toISOString() } : m)),
  );
}

export const archiveMaterial = (halaqaId: string, id: string) => setMaterialArchived(halaqaId, id, true);
export const restoreMaterial = (halaqaId: string, id: string) => setMaterialArchived(halaqaId, id, false);

function moveMaterial(halaqaId: string, id: string, dir: "up" | "down"): void {
  mutateHalaqa(halaqaId, (items) => {
    const active = items.filter((m) => !m.archived).sort((a, b) => a.order - b.order);
    const i = active.findIndex((m) => m.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= active.length) return items;
    const a = active[i];
    const b = active[j];
    return items.map((m) =>
      m.id === a.id ? { ...m, order: b.order } : m.id === b.id ? { ...m, order: a.order } : m,
    );
  });
}
export const moveMaterialUp = (halaqaId: string, id: string) => moveMaterial(halaqaId, id, "up");
export const moveMaterialDown = (halaqaId: string, id: string) => moveMaterial(halaqaId, id, "down");

// ---- reactive hooks --------------------------------------------------------

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

function useMaterialsList(
  halaqaId: string,
  getter: (halaqaId: string) => LearningMaterial[],
): LearningMaterial[] {
  const cache = useRef<{ sig: string; value: LearningMaterial[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): LearningMaterial[] => {
    const list = getter(halaqaId);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [halaqaId, getter]);
  const getServerSnapshot = useCallback(() => stableDefaults(halaqaId), [halaqaId]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Active (non-archived) materials — used by /child/progress. */
export function useMaterialsForHalaqa(halaqaId: string): LearningMaterial[] {
  return useMaterialsList(halaqaId, getMaterialsForHalaqa);
}

/** ALL materials incl. archived — used by the teacher manager. */
export function useAllMaterialsForHalaqa(halaqaId: string): LearningMaterial[] {
  return useMaterialsList(halaqaId, getAllMaterialsForHalaqa);
}
