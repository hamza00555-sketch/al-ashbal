"use client";

import { Card, ProgressBar, ProgressRing, SectionTitle } from "@/components";
import { useChildProgress, type ProgressBaseline } from "@/lib/demo/progress";

/**
 * Live progress UI for /child/progress. Both the three rings and the
 * "رحلة الشبل" bar read from the SAME demo helper (useChildProgress), so they
 * never show contradictory numbers and update after teacher acceptance.
 */
export function ProgressRingsCard({ childId, baseline }: { childId: string; baseline: ProgressBaseline }) {
  const m = useChildProgress(childId, baseline);
  return (
    <Card>
      {/* keep the rings grouped & centered even on wide screens */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
        <ProgressRing value={m.quranProgress} size={72} strokeWidth={8} tone="purple" sublabel="القرآن" />
        <ProgressRing value={m.tajweedProgress} size={72} strokeWidth={8} tone="gold" sublabel="التجويد" />
        <ProgressRing value={m.behaviorProgress} size={72} strokeWidth={8} tone="success" sublabel="السلوك" />
      </div>
    </Card>
  );
}

export function CubJourneyCard({ childId, baseline }: { childId: string; baseline: ProgressBaseline }) {
  const m = useChildProgress(childId, baseline);
  return (
    <Card className="flex flex-col gap-3">
      <SectionTitle title="رحلة الشبل" />
      <ProgressBar value={m.overallProgress} tone="purple" />
      <p className="text-caption text-on-dark-muted">باقي القليل على الإنجاز القادم.</p>
    </Card>
  );
}
