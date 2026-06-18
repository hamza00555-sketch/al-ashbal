"use client";

/*
  الأشبال — DEMO child-progress calculation (prototype only).

  Single source of truth for the numbers shown on /child/progress. It derives
  Quran / Tajweed / Behavior / overall progress from the LIVE demo state
  (points store + recitation submissions) layered on top of the seed baseline,
  so the three rings, the "رحلة الشبل" bar, and "نقاطي" stay in sync and react
  when the teacher accepts a recitation or awards points.

  This is a deliberately simple, documented demo formula — NOT a real scoring
  engine. It will be replaced by real backend metrics later. The seed snapshot
  is used only as a starting baseline so existing demo children still show
  sensible values before any activity happens.
*/
import { useMemo } from "react";
import { usePointsForChild, type PointEntry, type PointCategory } from "./points";
import { useSubmissions, type Submission } from "./submissions";

export interface ProgressBaseline {
  quran: number;
  tajweed: number;
  behavior: number;
}

export interface ChildProgressMetrics {
  quranProgress: number;
  tajweedProgress: number;
  behaviorProgress: number;
  overallProgress: number;
  pointsTotal: number;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const sumByCategory = (points: PointEntry[], cats: PointCategory[]) =>
  points.filter((p) => cats.includes(p.category)).reduce((sum, p) => sum + p.value, 0);

/**
 * Pure demo calculation (kept separate so it is easy to read / tweak / test):
 *  - القرآن  = baseline + (accepted recitations ×4) + (recitation points ×2)
 *  - التجويد = baseline + (recitation points ×1) + (activity points ×2)
 *  - السلوك  = baseline + (behavior-type points ×3)  // needs_follow_up is negative → lowers it
 *  - overall = متوسط القرآن + التجويد + السلوك
 * All metrics are clamped to 0..100.
 */
export function calcChildProgress(
  baseline: ProgressBaseline,
  points: PointEntry[],
  submissions: Submission[],
): ChildProgressMetrics {
  const acceptedRecitations = submissions.filter((s) => s.state === "accepted").length;
  const recitationPoints = sumByCategory(points, ["recitation"]);
  const activityPoints = sumByCategory(points, ["activity"]);
  const behaviorPoints = sumByCategory(points, [
    "behavior",
    "participation",
    "attendance",
    "improvement",
    "needs_follow_up",
  ]);

  const quranProgress = clamp(baseline.quran + acceptedRecitations * 4 + recitationPoints * 2);
  const tajweedProgress = clamp(baseline.tajweed + recitationPoints * 1 + activityPoints * 2);
  const behaviorProgress = clamp(baseline.behavior + behaviorPoints * 3);
  const overallProgress = Math.round((quranProgress + tajweedProgress + behaviorProgress) / 3);
  const pointsTotal = points.reduce((sum, p) => sum + p.value, 0);

  return { quranProgress, tajweedProgress, behaviorProgress, overallProgress, pointsTotal };
}

/** Reactive hook — recomputes whenever the points / submissions stores change. */
export function useChildProgress(childId: string, baseline: ProgressBaseline): ChildProgressMetrics {
  const points = usePointsForChild(childId);
  const submissions = useSubmissions();
  return useMemo(() => {
    const childSubs = Object.values(submissions).filter((s) => s.childId === childId);
    return calcChildProgress(baseline, points, childSubs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, baseline.quran, baseline.tajweed, baseline.behavior, points, submissions]);
}
