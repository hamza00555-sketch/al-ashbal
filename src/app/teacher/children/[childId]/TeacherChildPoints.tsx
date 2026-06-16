"use client";

import { Badge, Card, SectionTitle } from "@/components";
import type { BadgeTone } from "@/components";
import type { ChildStatusLevel } from "@/lib/data";
import {
  POINT_CATEGORY_LABEL,
  pointsAdjustedLevel,
  usePointsForChild,
  type PointSummary,
} from "@/lib/demo/points";
import { AddPointsButton, type AddPointsTarget } from "../AddPointsButton";

const LEVEL: Record<ChildStatusLevel, { label: string; tone: BadgeTone }> = {
  excellent: { label: "ممتاز", tone: "success" },
  follow_up: { label: "يحتاج متابعة", tone: "warning" },
  intervene: { label: "يحتاج تدخل", tone: "danger" },
};

function dayLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

/** Teacher's points panel for one child: total, recent, status nudge + add. */
export function TeacherChildPoints({
  target,
  baseLevel,
}: {
  target: AddPointsTarget;
  baseLevel: ChildStatusLevel;
}) {
  const points = usePointsForChild(target.childId);
  const summary: PointSummary = {
    total: points.reduce((sum, p) => sum + p.value, 0),
    count: points.length,
    recent: points.slice(0, 5),
    hasNeedsFollowUp: points.some((p) => p.category === "needs_follow_up"),
    hasNegative: points.some((p) => p.value < 0),
  };
  const level = pointsAdjustedLevel(baseLevel, summary);

  return (
    <Card className="flex flex-col gap-3 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle title="النقاط والتشجيع" />
        <AddPointsButton target={target} variant="primary" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="purple">إجمالي النقاط: {summary.total}</Badge>
        <Badge tone={LEVEL[level].tone}>الحالة مع النقاط: {LEVEL[level].label}</Badge>
      </div>
      {summary.recent.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {summary.recent.map((p) => (
            <li key={p.pointId} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-raised p-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-body font-bold break-words">{p.reason}</span>
                <span className="text-caption text-on-dark-muted">
                  {POINT_CATEGORY_LABEL[p.category]} · {dayLabel(p.createdAt)}
                  {p.note ? ` · ${p.note}` : ""}
                </span>
              </div>
              <Badge tone={p.value < 0 ? "danger" : "purple"}>{p.value < 0 ? p.value : `+${p.value}`}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-on-dark-muted">لا نقاط بعد — أضف أول نقطة تشجيعية.</p>
      )}
    </Card>
  );
}
