/* Child progress (/child/progress) — rings, cub-journey bar, badges. */
import { BadgeMedal, Card, CardOverlayMotif, PageHeader, SectionTitle } from "@/components";
import { getBadgesForChild } from "@/lib/data";
import { getChildContext } from "../_shared";
import { ChildPoints } from "./ChildPoints";
import { CubJourneyCard, ProgressRingsCard } from "./ProgressMetrics";

/** Map a badge's category to a medal asset key (falls back to a text pill). */
const BADGE_ASSET: Record<string, string | undefined> = {
  quran: "badge_recitation",
  behavior: "badge_good_behavior",
  progress: "badge_progress",
};

export default function ChildProgressPage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const badges = getBadgesForChild(viewer, child.id);

  return (
    <>
      <PageHeader title="تقدّمي" subtitle="القرآن · التجويد · السلوك" />

      <ProgressRingsCard childId={child.id} halaqaId={child.halaqaId} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CubJourneyCard childId={child.id} halaqaId={child.halaqaId} />

        <ChildPoints childId={child.id} />

        <section className="flex flex-col gap-3">
          <SectionTitle title="أوسمتي" />
          <Card variant="contrast" className="relative isolate overflow-hidden">
            <CardOverlayMotif motif="badge" className="-bottom-2 -end-1 size-28 text-gold opacity-[0.22]" />
            {badges.length > 0 ? (
              <div className="relative z-10 flex flex-wrap items-start gap-5">
                {badges.map((b) => {
                  const asset = BADGE_ASSET[b.category];
                  return (
                    <div key={b.id} className="flex w-20 flex-col items-center gap-1.5 text-center">
                      <BadgeMedal assetKey={asset} label={b.title} size={80} />
                      {asset && (
                        <span className="text-caption font-bold leading-tight text-[#241248] break-words">{b.title}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative z-10 flex items-center gap-4">
                <span className="shrink-0 opacity-60">
                  <BadgeMedal assetKey="badge_progress" label="وسام قادم" size={80} />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-card-title font-bold text-[#241248]">واصل لتفتح أوسمة جديدة</span>
                  <span className="text-caption text-[#5F4B7A]">أوسمتك القادمة تظهر هنا.</span>
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
