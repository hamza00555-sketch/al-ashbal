"use client";

import { AppAssetIcon, Badge, Card, SectionTitle } from "@/components";
import { POINT_CATEGORY_LABEL, usePointsForChild } from "@/lib/demo/points";
import { IconStar } from "../_icons";

function dayLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

/** "نقاطي" — the child's points: total + last 3 reasons. Demo store only. */
export function ChildPoints({ childId }: { childId: string }) {
  const points = usePointsForChild(childId);
  const total = points.reduce((sum, p) => sum + p.value, 0);
  const recent = points.slice(0, 3);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AppAssetIcon src="/assets/icons/icon_points.png" size="lg" className="text-gold" fallback={<IconStar />} />
          <SectionTitle title="نقاطي" />
        </div>
        {points.length > 0 && <Badge tone="gold">إجمالي {total}</Badge>}
      </div>
      {recent.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {recent.map((p) => (
            <li key={p.pointId} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-raised p-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-body font-bold break-words">{p.reason}</span>
                <span className="text-caption text-on-dark-muted">{POINT_CATEGORY_LABEL[p.category]} · {dayLabel(p.createdAt)}</span>
              </div>
              <Badge tone={p.value < 0 ? "danger" : "purple"}>{p.value < 0 ? p.value : `+${p.value}`}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body text-on-dark-muted">ابدأ رحلتك واجمع نقاطك من المشاركة والتسميع.</p>
      )}
    </Card>
  );
}
