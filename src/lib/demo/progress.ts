"use client";

/*
  الأشبال — DEMO child-progress calculation (Phase A: materials-driven).

  Single source of truth for /child/progress. Progress is no longer hardcoded
  per subject: it is derived from the child's points attributed to the halaqa's
  LEARNING MATERIALS. Each visible material becomes one progress ring; the
  "رحلة الشبل" bar is the average of the visible materials' progress.

  Demo formula (documented, not a real scoring engine — replaced by backend
  later):
    materialProgress = clamp( round( earnedPoints / targetPoints × 100 ) )
    overallProgress  = average( progress of materials where showInChildProgress )

  Points are attributed to a material by `point.materialId` when present;
  otherwise a legacy fallback maps the point's category → material type
  (FALLBACK_CATEGORY_TO_TYPE), so old data without materialId still counts.
*/
import { useMemo } from "react";
import { usePointsForChild, type PointEntry } from "./points";
import {
  FALLBACK_CATEGORY_TO_TYPE,
  useMaterialsForHalaqa,
  type LearningMaterial,
  type MaterialColorToken,
  type MaterialType,
} from "./materials";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export interface MaterialProgress {
  materialId: string;
  name: string;
  type: MaterialType;
  iconKey: string;
  colorToken: MaterialColorToken;
  progress: number; // 0..100
  earnedPoints: number;
  targetPoints: number;
  order: number;
}

export interface ChildProgress {
  materials: MaterialProgress[]; // visible only, ordered
  overallProgress: number;
  pointsTotal: number;
}

/** Resolve which material a point belongs to (explicit id, else legacy fallback). */
function pointMaterialId(point: PointEntry, materials: LearningMaterial[]): string | undefined {
  if (point.materialId) return point.materialId;
  const fallbackType = FALLBACK_CATEGORY_TO_TYPE[point.category];
  return materials.find((m) => m.type === fallbackType)?.id;
}

/** Pure calculation (easy to read / test). */
export function calcChildProgress(materials: LearningMaterial[], points: PointEntry[]): ChildProgress {
  const visible = materials.filter((m) => m.showInChildProgress).sort((a, b) => a.order - b.order);

  const materialProgress: MaterialProgress[] = visible.map((m) => {
    const earnedPoints = points.reduce(
      (sum, p) => (pointMaterialId(p, materials) === m.id ? sum + p.value : sum),
      0,
    );
    const progress = m.targetPoints > 0 ? clamp((earnedPoints / m.targetPoints) * 100) : 0;
    return {
      materialId: m.id,
      name: m.name,
      type: m.type,
      iconKey: m.iconKey,
      colorToken: m.colorToken,
      progress,
      earnedPoints,
      targetPoints: m.targetPoints,
      order: m.order,
    };
  });

  const overallProgress =
    materialProgress.length > 0
      ? Math.round(materialProgress.reduce((s, x) => s + x.progress, 0) / materialProgress.length)
      : 0;
  const pointsTotal = points.reduce((sum, p) => sum + p.value, 0);

  return { materials: materialProgress, overallProgress, pointsTotal };
}

/** Reactive hook — recomputes when the points / materials stores change. */
export function useChildProgress(childId: string, halaqaId: string): ChildProgress {
  const points = usePointsForChild(childId);
  const materials = useMaterialsForHalaqa(halaqaId);
  return useMemo(() => calcChildProgress(materials, points), [materials, points]);
}
