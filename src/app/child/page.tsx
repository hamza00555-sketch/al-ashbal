/*
  Child home (/child) — a short follow-up summary, NOT a place to do tasks.
  Greeting, today's lesson brief, today's attendance, progress glance, an
  open-tasks alert (→ /child/tasks), and the active class activity (if any).
*/
import Link from "next/link";
import { AppAssetIcon, Avatar, Badge, Card, PageHeader, ProgressBar, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import {
  getAttendanceForChild,
  getNextLessonForChild,
  getProgressForChild,
  getTasksForChild,
} from "@/lib/data";
import { IconSparkle, IconStar, IconTasks } from "./_icons";
import { ATTENDANCE_STATUS, getChildContext, isOpenTask } from "./_shared";
import { ChildActivity } from "./ChildActivity";

const ctaLink =
  "gradient-cta flex min-h-12 w-full items-center justify-center rounded-lg px-8 text-button font-bold text-cream shadow-glow transition hover:brightness-110";
const glanceLink =
  "flex min-h-11 items-center justify-center gap-2 rounded-md bg-surface-raised px-4 text-caption font-bold text-on-dark transition hover:bg-white/5";

export default function ChildHomePage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const nextLesson = getNextLessonForChild(viewer, child.id);
  const progress = getProgressForChild(viewer, child.id);
  const tasks = getTasksForChild(viewer, child.id);
  const openTasks = tasks.filter((t) => isOpenTask(t.status)).length;
  const attendance = getAttendanceForChild(viewer, child.id);
  const latestAttendance = attendance[attendance.length - 1] ?? null;

  return (
    <>
      <PageHeader
        eyebrow="مرحباً"
        title={child.displayName}
        subtitle="هذه لوحتك المختصرة"
        leading={<Avatar name={child.displayName} size="hero" src={childAvatarSrc(child.gender)} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card variant="gradient" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption text-on-dark-muted">درس اليوم</span>
              {nextLesson && <Badge tone="purple">اليوم</Badge>}
            </div>
            <h2 className="text-h2 break-words">{nextLesson?.title ?? "لا يوجد درس مجدول الآن"}</h2>
            {nextLesson?.quranSegment && (
              <p className="text-body text-on-dark-muted break-words">القرآن: {nextLesson.quranSegment}</p>
            )}
            <Link href="/child/lessons" className={ctaLink}>تفاصيل الدرس</Link>
          </Card>

          {openTasks > 0 && (
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AppAssetIcon
                  src="/assets/icons/icon_tasks.png"
                  size="md"
                  className="rounded-full bg-purple/15 text-purple-soft"
                  fallback={<IconTasks />}
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold">لديك {openTasks} مهمة بانتظارك</span>
                  <span className="text-caption text-on-dark-muted">تسميع وحفظ ومراجعة</span>
                </div>
              </div>
              <Link
                href="/child/tasks"
                className="flex min-h-11 items-center justify-center rounded-md bg-surface-raised px-4 text-caption font-bold text-on-dark transition hover:bg-white/5"
              >
                اذهب إلى مهامي
              </Link>
            </Card>
          )}

          <ChildActivity
            halaqaId={child.halaqaId}
            childId={child.id}
            childName={child.displayName}
            childUserId={child.userId ?? ""}
          />
        </div>

        {/* side column */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <SectionTitle title="حالة اليوم" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-body text-on-dark-muted">الحضور</span>
              {latestAttendance ? (
                <Badge tone={ATTENDANCE_STATUS[latestAttendance.status].tone}>
                  {ATTENDANCE_STATUS[latestAttendance.status].label}
                </Badge>
              ) : (
                <Badge tone="neutral">—</Badge>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <SectionTitle title="لمحة عن التقدّم" />
            <ProgressBar value={progress?.currentProgressBar.current ?? 0} tone="purple" label="رحلة الشبل" />
            <div className="grid grid-cols-2 gap-3">
              <Link href="/child/tasks" className={glanceLink}>
                <AppAssetIcon src="/assets/icons/icon_tasks.png" size="sm" className="text-purple-soft" fallback={<IconTasks />} /> مهامي
              </Link>
              <Link href="/child/progress" className={glanceLink}>
                <AppAssetIcon src="/assets/icons/icon_progress.png" size="sm" className="text-gold" fallback={<IconStar />} /> التقدّم
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* مساحتي — روابط تقدّمي وأمنياتي (خرجت من البار السفلي). تظهر في الرئيسية فقط. */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="مساحتي" />
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/child/progress"
            className="flex flex-col gap-2 rounded-lg bg-surface-raised p-4 transition hover:bg-white/5"
          >
            <AppAssetIcon
              src="/assets/icons/icon_progress.png"
              size="md"
              className="rounded-full bg-gold/15 text-gold"
              fallback={<IconStar />}
            />
            <span className="text-card-title font-bold">تقدّمي</span>
            <span className="text-caption text-on-dark-muted">تابع نقاطك وأوسمتك</span>
          </Link>
          <Link
            href="/child/wishes"
            className="flex flex-col gap-2 rounded-lg bg-surface-raised p-4 transition hover:bg-white/5"
          >
            <AppAssetIcon
              src="/assets/icons/icon_wishes.png"
              size="md"
              className="rounded-full bg-purple/15 text-purple-soft"
              fallback={<IconSparkle />}
            />
            <span className="text-card-title font-bold">أمنياتي</span>
            <span className="text-caption text-on-dark-muted">اكتب ما تتمنى تحقيقه</span>
          </Link>
        </div>
      </section>
    </>
  );
}
