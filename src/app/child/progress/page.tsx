/* Child progress (/child/progress) — rings, cub-journey bar, badges. */
import { Badge, Card, PageHeader, ProgressBar, ProgressRing, SectionTitle } from "@/components";
import { getBadgesForChild, getProgressForChild } from "@/lib/data";
import { getChildContext } from "../_shared";

export default function ChildProgressPage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const progress = getProgressForChild(viewer, child.id);
  const badges = getBadgesForChild(viewer, child.id);

  return (
    <>
      <PageHeader title="تقدّمي" subtitle="القرآن · التجويد · السلوك" />

      <Card className="flex items-center justify-between gap-2">
        <ProgressRing value={progress?.quranPercent ?? 0} size={72} strokeWidth={8} tone="purple" sublabel="القرآن" />
        <ProgressRing value={progress?.tajweedPercent ?? 0} size={72} strokeWidth={8} tone="gold" sublabel="التجويد" />
        <ProgressRing value={progress?.behaviorPercent ?? 0} size={72} strokeWidth={8} tone="success" sublabel="السلوك" />
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle title="رحلة الشبل" />
        <ProgressBar value={progress?.currentProgressBar.current ?? 0} tone="purple" />
        <p className="text-caption text-on-dark-muted">باقي القليل على الإنجاز القادم.</p>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle title="أوسمتي" />
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b.id} tone="gold">{b.title}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-body text-on-dark-muted">لا أوسمة بعد — أحسنت واستمر!</p>
        )}
      </Card>
    </>
  );
}
