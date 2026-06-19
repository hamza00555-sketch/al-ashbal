/*
  Child home (/child) — a short follow-up summary, NOT a place to do tasks.
  Greeting, today's lesson brief, today's attendance, progress glance, an
  open-tasks alert (→ /child/tasks), and the active class activity (if any).
*/
import Link from "next/link";
import { AppAssetIcon, Badge, Card, CardOverlayMotif, ChildDisplayAvatar, ChildDisplayName, PageHeader, ProgressBar, SectionTitle, SettingsLink } from "@/components";
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
import { ChildTodayCard } from "./ChildTodayCard";

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
        title={<ChildDisplayName childId={child.id} fallback={child.displayName} />}
        subtitle="هذه لوحتك المختصرة"
        leading={<ChildDisplayAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} />}
        actions={<SettingsLink label="ملفي" role="child" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ChildTodayCard
            halaqaId={child.halaqaId}
            fallbackTitle={nextLesson?.title}
            fallbackQuran={nextLesson?.quranSegment ? `القرآن: ${nextLesson.quranSegment}` : undefined}
          />

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
            className="card-contrast relative isolate flex flex-col gap-2 overflow-hidden rounded-lg p-4 shadow-soft ring-1 ring-black/5 transition hover:brightness-[1.03]"
          >
            <CardOverlayMotif motif="progress" className="-bottom-5 -end-6 size-32 text-purple opacity-[0.12]" />
            <AppAssetIcon
              src="/assets/icons/icon_progress.png"
              size="md"
              className="relative z-10 rounded-full bg-gold/20 text-gold"
              fallback={<IconStar />}
            />
            <span className="relative z-10 text-card-title font-bold">تقدّمي</span>
            <span className="relative z-10 text-caption text-[#5F4B7A]">تابع نقاطك وأوسمتك</span>
          </Link>
          <Link
            href="/child/wishes"
            className="card-contrast relative isolate flex flex-col gap-2 overflow-hidden rounded-lg p-4 shadow-soft ring-1 ring-black/5 transition hover:brightness-[1.03]"
          >
            <CardOverlayMotif motif="wishes" className="-bottom-5 -end-5 size-32 text-gold opacity-[0.13]" />
            <AppAssetIcon
              src="/assets/icons/icon_wishes.png"
              size="md"
              className="relative z-10 rounded-full bg-purple/20 text-purple-soft"
              fallback={<IconSparkle />}
            />
            <span className="relative z-10 text-card-title font-bold">أمنياتي</span>
            <span className="relative z-10 text-caption text-[#5F4B7A]">اكتب ما تتمنى تحقيقه</span>
          </Link>
        </div>
      </section>
    </>
  );
}
