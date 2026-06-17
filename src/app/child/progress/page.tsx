/* Child progress (/child/progress) — rings, cub-journey bar, badges. */
import { BadgeMedal, Card, CardOverlayMotif, PageHeader, ProgressBar, ProgressRing, SectionTitle } from "@/components";
import { getBadgesForChild, getProgressForChild } from "@/lib/data";
import { getChildContext } from "../_shared";
import { ChildPoints } from "./ChildPoints";

/** Map a badge's category to a medal asset key (falls back to a text pill). */
const BADGE_ASSET: Record<string, string | undefined> = {
  quran: "badge_recitation",
  behavior: "badge_good_behavior",
  progress: "badge_progress",
};

export default function ChildProgressPage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const progress = getProgressForChild(viewer, child.id);
  const badges = getBadgesForChild(viewer, child.id);

  return (
    <>
      <PageHeader title="تقدّمي" subtitle="القرآن · التجويد · السلوك" />

      <Card>
        {/* keep the rings grouped & centered even on wide screens */}
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
          <ProgressRing value={progress?.quranPercent ?? 0} size={72} strokeWidth={8} tone="purple" sublabel="القرآن" />
          <ProgressRing value={progress?.tajweedPercent ?? 0} size={72} strokeWidth={8} tone="gold" sublabel="التجويد" />
          <ProgressRing value={progress?.behaviorPercent ?? 0} size={72} strokeWidth={8} tone="success" sublabel="السلوك" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <SectionTitle title="رحلة الشبل" />
          <ProgressBar value={progress?.currentProgressBar.current ?? 0} tone="purple" />
          <p className="text-caption text-on-dark-muted">باقي القليل على الإنجاز القادم.</p>
        </Card>

        <ChildPoints childId={child.id} />

        <section className="flex flex-col gap-3">
          <SectionTitle title="أوسمتي" />
          <Card variant="contrast" className="relative isolate overflow-hidden">
            <CardOverlayMotif motif="badge" className="bottom-2 end-3 size-20 text-gold opacity-[0.12]" />
            {badges.length > 0 ? (
              <div className="relative z-10 flex flex-wrap items-center gap-3">
                {badges.map((b) => (
                  <BadgeMedal key={b.id} assetKey={BADGE_ASSET[b.category]} label={b.title} />
                ))}
              </div>
            ) : (
              <p className="relative z-10 text-body text-[#5F4B7A]">لا أوسمة بعد — أحسنت واستمر!</p>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
