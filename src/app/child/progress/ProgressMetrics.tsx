"use client";

import { Card, ProgressBar, ProgressRing, SectionTitle } from "@/components";
import { useChildProgress } from "@/lib/demo/progress";

/**
 * Live progress UI for /child/progress. Both the rings and the "رحلة الشبل" bar
 * read from the SAME demo helper (useChildProgress), which is driven by the
 * halaqa's learning materials — so the page shows one ring PER material
 * (dynamic count) and the bar is the average of the visible materials.
 */
export function ProgressRingsCard({ childId, halaqaId }: { childId: string; halaqaId: string }) {
  const { materials } = useChildProgress(childId, halaqaId);

  if (materials.length === 0) {
    return (
      <Card>
        <p className="text-body text-on-dark-muted">لا توجد مواد لعرض تقدّمها بعد.</p>
      </Card>
    );
  }

  return (
    <Card>
      {/* one ring per visible material — keep them grouped & centered */}
      <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-4">
        {materials.map((m) => (
          <ProgressRing
            key={m.materialId}
            value={m.progress}
            size={72}
            strokeWidth={8}
            tone={m.colorToken}
            sublabel={m.name}
          />
        ))}
      </div>
    </Card>
  );
}

export function CubJourneyCard({ childId, halaqaId }: { childId: string; halaqaId: string }) {
  const { overallProgress } = useChildProgress(childId, halaqaId);
  return (
    <Card className="flex flex-col gap-3">
      <SectionTitle title="رحلة الشبل" />
      <ProgressBar value={overallProgress} tone="purple" />
      <p className="text-caption text-on-dark-muted">باقي القليل على الإنجاز القادم.</p>
    </Card>
  );
}
