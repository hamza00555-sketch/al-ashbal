/* Child home (/child) — greeting, today's mission, recitation task, quick glance. */
import Link from "next/link";
import { Avatar, Badge, Button, Card, PageHeader, ProgressBar, SectionTitle } from "@/components";
import {
  getNextLessonForChild,
  getProgressForChild,
  getRecitationsForViewer,
  getWishesForViewer,
} from "@/lib/data";
import { IconBell, IconMic, IconSparkle, IconStar } from "./_icons";
import { getChildContext, RECITATION_STATUS } from "./_shared";

const glanceLink =
  "flex min-h-11 items-center justify-center gap-2 rounded-md bg-surface-raised px-4 text-caption font-bold text-on-dark transition hover:bg-white/5";

export default function ChildHomePage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const nextLesson = getNextLessonForChild(viewer, child.id);
  const recitations = getRecitationsForViewer(viewer, child.id);
  const current = recitations.find((r) => r.status !== "teacher_reviewed") ?? recitations[0] ?? null;
  const status = current ? RECITATION_STATUS[current.status] : null;
  const progress = getProgressForChild(viewer, child.id);
  const wishesCount = getWishesForViewer(viewer, child.id).length;

  return (
    <>
      <PageHeader
        eyebrow="مرحباً"
        title={child.displayName}
        subtitle="جاهز لمهمة اليوم؟"
        leading={<Avatar name={child.displayName} size="lg" />}
        actions={
          <Button variant="ghost" size="sm" aria-label="التنبيهات">
            <span className="inline-flex size-5 items-center justify-center"><IconBell /></span>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card variant="gradient" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption text-on-dark-muted">مهمة اليوم</span>
              {nextLesson && <Badge tone="purple">اليوم</Badge>}
            </div>
            <h2 className="text-h2 break-words">{nextLesson?.title ?? "لا يوجد درس مجدول الآن"}</h2>
            {nextLesson?.quranSegment && (
              <p className="text-body text-on-dark-muted break-words">القرآن: {nextLesson.quranSegment}</p>
            )}
            <Link
              href="/child/lessons"
              className="gradient-cta flex min-h-12 w-full items-center justify-center rounded-lg px-8 text-button font-bold text-cream shadow-glow transition hover:brightness-110"
            >
              ادخل الدرس
            </Link>
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionTitle title="مهمة التسميع" />
            {current && status ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{current.title}</span>
                  <span><Badge tone={status.tone}>{status.label}</Badge></span>
                </div>
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-3 text-purple-soft">
                  <IconMic />
                </span>
              </div>
            ) : (
              <p className="text-body text-on-dark-muted">لا توجد مهمة تسميع الآن.</p>
            )}
            <Button variant="secondary" fullWidth leadingIcon={<span className="inline-flex size-5"><IconMic /></span>}>
              سجّل تسميعك
            </Button>
          </Card>
        </div>

        {/* side column */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <SectionTitle title="لمحة سريعة" />
            <ProgressBar value={progress?.currentProgressBar.current ?? 0} tone="purple" label="رحلة الشبل" />
            <div className="grid grid-cols-2 gap-3">
              <Link href="/child/progress" className={glanceLink}>
                <span className="inline-flex size-5 text-gold"><IconStar /></span> التقدّم
              </Link>
              <Link href="/child/wishes" className={glanceLink}>
                <span className="inline-flex size-5 text-purple-soft"><IconSparkle /></span> أمنياتي ({wishesCount})
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
