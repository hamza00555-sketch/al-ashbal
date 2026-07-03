/*
  Teacher overview (/teacher) — INFORMATION ONLY.
  All teacher tools/navigation live exclusively in the desktop sidebar and the
  mobile «☰ أدوات المعلم» drawer (one source: _nav.tsx). No navigation tiles
  here — just a welcome, live counts, and the last-lesson summary.
*/
import { Badge, Card, PageHeader, RoleAvatar, SectionTitle, SettingsLink, StatCard } from "@/components";
import {
  getAttendanceForLesson,
  getLessonsForTeacher,
  getPendingTeacherReviews,
} from "@/lib/data";
import { countPendingJoinRequests } from "@/lib/backend/joinRequests";
import { IconBook, IconCalendar, IconUsers, IconVideo } from "./_icons";
import { getTeacherContext } from "./_shared";
import { TeacherReviewAlert } from "./TeacherReviewAlert";
import { TeacherIdentityStrip } from "./TeacherIdentityStrip";
import { TeacherName } from "./TeacherIdentity";
import { EnrolledChildCountStat } from "./EnrolledChildCountStat";

const chip = "inline-flex size-8 items-center justify-center";

export default async function TeacherOverviewPage() {
  const { viewer, halaqas } = getTeacherContext();
  const lessons = getLessonsForTeacher(viewer);

  // Live count from the backend (RLS: approved teachers). Fails safe to null →
  // rendered as «—» without breaking the page.
  const pendingJoinRequests = await countPendingJoinRequests().catch(() => null);

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
        eyebrow="مرحبًا"
        title={<TeacherName fallback={viewer.displayName} />}
        subtitle="هذه لوحة المتابعة الخاصة بك."
        leading={<RoleAvatar role="teacher" fallbackName={viewer.displayName} fallbackSrc="/assets/avatars/avatar_teacher_male_01.png" />}
        actions={<SettingsLink role="teacher" />}
      />

      <TeacherIdentityStrip />

      <TeacherReviewAlert teacherId={viewer.id} dbPendingReviews={pendingReviews.length} />

      {/* Where the tools live now — one calm hint, no navigation tiles. */}
      <Card variant="lavender" className="py-3">
        <p className="text-body text-on-dark">
          كل أدوات المعلم — الدعوات، طلبات الانضمام، الأطفال، المراجعات وغيرها — في{" "}
          <span className="font-bold">القائمة الجانبية</span> على الشاشات الكبيرة، وفي زر{" "}
          <span className="whitespace-nowrap font-bold">«☰ أدوات المعلم»</span> أعلى الصفحة على الجوال.
        </p>
      </Card>

      {/* Info summary — numbers only, not navigation */}
      <section className="flex flex-col gap-4">
        <SectionTitle title="ملخص اليوم" subtitle={`الحلقة: ${halaqaName}`} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            variant="plum"
            label="طلبات انضمام معلقة"
            value={pendingJoinRequests ?? "—"}
            tone={pendingJoinRequests ? "danger" : "success"}
            icon={<span className={chip}><IconUsers /></span>}
            hint="تُراجع من قائمة الأدوات"
          />
          {halaqas[0] ? (
            <EnrolledChildCountStat halaqaId={halaqas[0].id} />
          ) : (
            <StatCard variant="lavender" label="أطفال الحلقة" value={0} tone="purple" icon={<span className={chip}><IconUsers /></span>} />
          )}
          <StatCard
            variant="plum"
            label="بانتظار المراجعة"
            value={pendingReviews.length}
            tone={pendingReviews.length > 0 ? "danger" : "success"}
            icon={<span className={chip}><IconVideo /></span>}
            hint="فيديوهات معتمدة"
          />
          <StatCard
            label="حلقة اليوم"
            value={todayLesson ? todayLesson.startTime : "—"}
            tone="purple"
            icon={<span className={chip}><IconCalendar /></span>}
            hint={todayLesson?.title ?? "لا حلقة اليوم"}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Last lesson summary */}
        <Card className="flex flex-col gap-4">
          <SectionTitle title="ملخص آخر درس" />
          {lastLesson ? (
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-purple/15 p-2 text-purple">
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

        {/* Last attendance — info only */}
        <Card variant="lavender" className="flex flex-col gap-3">
          <SectionTitle title="حضور آخر حلقة" />
          {lastLesson ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-purple/15 p-2 text-purple">
                <IconCalendar />
              </span>
              <div className="flex flex-col">
                <span className="text-card-title font-bold text-on-dark">
                  {present}/{lastAttendance.length} حاضر
                </span>
                <span className="text-caption text-on-dark-muted">{lastLesson.date}</span>
              </div>
            </div>
          ) : (
            <p className="text-body text-on-dark-muted">لا يوجد سجل حضور بعد.</p>
          )}
        </Card>
      </div>
    </>
  );
}
