/*
  Teacher overview (Phase 01 · Task 7) — /teacher.
  Desktop-first dashboard overview. Viewer-scoped accessors only; the teacher
  sees only their own halaqa. No wishes, no unapproved videos.
*/
import Link from "next/link";
import { Avatar, Badge, Card, PageHeader, SectionTitle, StatCard } from "@/components";
import {
  getAttendanceForLesson,
  getLessonsForTeacher,
  getPendingTeacherReviews,
} from "@/lib/data";
import { IconBook, IconCalendar, IconUsers, IconVideo } from "./_icons";
import { getTeacherContext } from "./_shared";
import { TeacherReviewAlert } from "./TeacherReviewAlert";

const chip = "inline-flex size-6 items-center justify-center";

export default function TeacherOverviewPage() {
  const { viewer, halaqas, children } = getTeacherContext();
  const lessons = getLessonsForTeacher(viewer);

  const todayLesson =
    lessons.find((l) => l.status === "live") ??
    lessons
      .filter((l) => l.status === "scheduled")
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0] ??
    null;

  const lastLesson =
    lessons
      .filter((l) => l.status === "completed")
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))[0] ??
    null;

  const lastAttendance = lastLesson ? getAttendanceForLesson(viewer, lastLesson.id) : [];
  const present = lastAttendance.filter((a) => a.status === "present").length;
  const pendingReviews = getPendingTeacherReviews(viewer);
  const halaqaName = halaqas[0]?.name ?? "—";

  return (
    <>
      <PageHeader
        eyebrow={halaqaName}
        title={viewer.displayName}
        subtitle="لوحة المعلم — متابعة الحلقة"
        leading={<Avatar name={viewer.displayName} size="lg" />}
      />

      <TeacherReviewAlert teacherId={viewer.id} dbPendingReviews={pendingReviews.length} />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="حلقة اليوم" value={todayLesson ? todayLesson.startTime : "—"} tone="purple" icon={<span className={chip}><IconCalendar /></span>} hint={todayLesson?.title ?? "لا حلقة اليوم"} />
        <StatCard label="أطفال الحلقة" value={children.length} tone="purple" icon={<span className={chip}><IconUsers /></span>} />
        <StatCard label="الحضور" value={lastLesson ? `${present}/${lastAttendance.length}` : "—"} tone="success" icon={<span className={chip}><IconCalendar /></span>} hint="آخر حلقة" />
        <StatCard label="بانتظار المراجعة" value={pendingReviews.length} tone={pendingReviews.length > 0 ? "gold" : "success"} icon={<span className={chip}><IconVideo /></span>} hint="فيديوهات معتمدة" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last lesson summary */}
        <Card className="flex flex-col gap-4">
          <SectionTitle title="ملخص آخر درس" />
          {lastLesson ? (
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-purple/15 p-2.5 text-purple-soft">
                <IconBook />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-card-title font-bold break-words">{lastLesson.title}</span>
                <span className="text-caption text-on-dark-muted">{lastLesson.date}</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {lastLesson.quranSegment && <Badge tone="purple">قرآن: {lastLesson.quranSegment}</Badge>}
                  {lastLesson.tajweedTopic && <Badge tone="neutral">تجويد: {lastLesson.tajweedTopic}</Badge>}
                  {lastLesson.behaviorTopic && <Badge tone="neutral">سلوك: {lastLesson.behaviorTopic}</Badge>}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-body text-on-dark-muted">لا يوجد درس سابق.</p>
          )}
        </Card>

        {/* Quick tasks */}
        <Card className="flex flex-col gap-3">
          <SectionTitle title="مهام اليوم" />
          <Link href="/teacher/reviews" className="flex items-center justify-between gap-3 rounded-md bg-surface-raised px-4 py-3 text-button text-on-dark transition hover:bg-white/5">
            <span>مراجعة التسميعات</span>
            <Badge tone={pendingReviews.length > 0 ? "gold" : "neutral"}>{pendingReviews.length}</Badge>
          </Link>
          <Link href="/teacher/attendance" className="flex items-center justify-between gap-3 rounded-md bg-surface-raised px-4 py-3 text-button text-on-dark transition hover:bg-white/5">
            <span>تسجيل حضور حلقة اليوم</span>
            <span className="inline-flex size-5 text-purple-soft"><IconCalendar /></span>
          </Link>
          <Link href="/teacher/children" className="flex items-center justify-between gap-3 rounded-md bg-surface-raised px-4 py-3 text-button text-on-dark transition hover:bg-white/5">
            <span>أطفال الحلقة</span>
            <span className="inline-flex size-5 text-purple-soft"><IconUsers /></span>
          </Link>
        </Card>
      </div>
    </>
  );
}
