/*
  Parent · child detail (/parent/children/[childId]) — one child only.
  Gated by getChildById; a parent can never view a child they aren't linked to.
*/
import { Badge, Card, ChildDisplayAvatar, ChildDisplayName, PageHeader, ProgressRing, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { childProfiles } from "@/lib/data/children";
import {
  getAttendanceForChild,
  getBadgesForChild,
  getChildStatusSummary,
  getNextLessonForChild,
  getProgressForChild,
  getRecitationsForViewer,
  getTasksForChild,
  getTeacherReviewsForChild,
  getWishesForViewer,
  type ChildStatusLevel,
} from "@/lib/data";
import {
  ATTENDANCE_STATUS,
  CHILD_STATUS,
  getParentContext,
  RECITATION_STATUS,
  TASK_STATUS,
} from "../../_shared";
import { ParentPoints } from "./ParentPoints";
import { ParentPrepInfo } from "./ParentPrepInfo";
import { CreatedChildDetail } from "./CreatedChildDetail";

// No generateStaticParams: the parent layout is auth-gated per request
// (cookies), so nothing under /parent may be prerendered at build time.

const RING_TONE: Record<ChildStatusLevel, "success" | "gold" | "purple"> = {
  excellent: "success",
  follow_up: "gold",
  intervene: "purple",
};

export default async function ParentChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const { viewer } = getParentContext();
  // Demo: seed children resolve server-side; parent-CREATED children live only
  // in localStorage, so they're resolved client-side by CreatedChildDetail.
  const child = childProfiles.find((c) => c.id === childId) ?? null;

  if (!child) {
    return <CreatedChildDetail childId={childId} />;
  }

  const status = getChildStatusSummary(viewer, child.id);
  const progress = getProgressForChild(viewer, child.id);
  const nextLesson = getNextLessonForChild(viewer, child.id);
  const tasks = getTasksForChild(viewer, child.id).filter((t) => t.status !== "accepted");
  const recitations = getRecitationsForViewer(viewer, child.id);
  const lastRecitation = recitations[recitations.length - 1] ?? null;
  const reviews = getTeacherReviewsForChild(viewer, child.id);
  const lastReview = reviews[reviews.length - 1] ?? null;
  const teacherNote = lastReview?.teacherNote ?? lastReview?.behaviorNote ?? null;
  const badges = getBadgesForChild(viewer, child.id);
  const wishes = getWishesForViewer(viewer, child.id);

  const attendance = getAttendanceForChild(viewer, child.id);
  const latestAttendance = attendance[attendance.length - 1] ?? null;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendancePercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const level = status?.level ?? "follow_up";

  return (
    <>
      <PageHeader
        eyebrow="تفاصيل الطفل"
        title={<ChildDisplayName childId={child.id} fallback={child.displayName} />}
        leading={<ChildDisplayAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} size="profile" />}
        actions={<Badge tone={CHILD_STATUS[level].tone}>{CHILD_STATUS[level].label}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <ParentPrepInfo halaqaId={child.halaqaId} />

        {/* Progress ring */}
        <Card className="flex flex-col items-center gap-3">
          <SectionTitle title="التقدّم العام" className="w-full" />
          <ProgressRing value={status?.progressPercent ?? 0} size={120} strokeWidth={12} tone={RING_TONE[level]} />
          <div className="flex flex-wrap justify-center gap-2">
            <Badge tone="purple">قرآن {progress?.quranPercent ?? 0}%</Badge>
            <Badge tone="gold">تجويد {progress?.tajweedPercent ?? 0}%</Badge>
            <Badge tone="success">سلوك {progress?.behaviorPercent ?? 0}%</Badge>
          </div>
        </Card>

        {/* Attendance + lesson */}
        <Card className="flex flex-col gap-4 lg:col-span-2">
          <SectionTitle title="الحضور ودرس اليوم" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body text-on-dark-muted">آخر حضور:</span>
            {latestAttendance ? (
              <Badge tone={ATTENDANCE_STATUS[latestAttendance.status].tone}>
                {ATTENDANCE_STATUS[latestAttendance.status].label}
              </Badge>
            ) : (
              <Badge tone="neutral">—</Badge>
            )}
            <Badge tone="gold">نسبة الحضور التقريبية {attendancePercent}%</Badge>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-caption text-on-dark-muted">الدرس القادم</span>
              <span className="text-body break-words">
                {nextLesson ? `${nextLesson.title}${nextLesson.quranSegment ? ` — ${nextLesson.quranSegment}` : ""}` : "لا يوجد درس مجدول"}
              </span>
            </div>
          </div>
        </Card>

        {/* Tasks */}
        <Card className="flex flex-col gap-3">
          <SectionTitle title="المهام المفتوحة" />
          {tasks.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-2">
                  <span className="text-body break-words">{t.title}</span>
                  <Badge tone={TASK_STATUS[t.status].tone}>{TASK_STATUS[t.status].label}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-on-dark-muted">لا مهام مفتوحة.</p>
          )}
        </Card>

        {/* Recitations */}
        <Card className="flex flex-col gap-3">
          <SectionTitle title="التسميعات" />
          {lastRecitation ? (
            <div className="flex items-start justify-between gap-2">
              <span className="text-body break-words">{lastRecitation.title}</span>
              <Badge tone={RECITATION_STATUS[lastRecitation.status].tone}>
                {RECITATION_STATUS[lastRecitation.status].label}
              </Badge>
            </div>
          ) : (
            <p className="text-body text-on-dark-muted">لا تسميعات بعد.</p>
          )}
        </Card>

        {/* Points (demo store, client) */}
        <ParentPoints childId={child.id} />

        {/* Teacher note */}
        <Card className="flex flex-col gap-3">
          <SectionTitle title="ملاحظات المعلم" />
          <p className="text-body text-on-dark-muted break-words">
            {teacherNote ?? "لا ملاحظات بعد."}
          </p>
        </Card>

        {/* Badges */}
        <Card className="flex flex-col gap-3">
          <SectionTitle title="الأوسمة" />
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <Badge key={b.id} tone="gold">{b.title}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-body text-on-dark-muted">لا أوسمة بعد.</p>
          )}
        </Card>

        {/* Wishes (parent-only) */}
        <Card className="flex flex-col gap-3 lg:col-span-2">
          <SectionTitle title="الأمنيات" subtitle="تظهر لك فقط" />
          {wishes.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {wishes.map((w) => (
                <li key={w.id} className="flex flex-col gap-0.5">
                  <span className="text-body break-words">{w.title}</span>
                  {w.description && (
                    <span className="text-caption text-on-dark-muted break-words">{w.description}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-on-dark-muted">لا أمنيات بعد.</p>
          )}
        </Card>

        {/* Last activity */}
        <Card className="flex flex-col gap-2">
          <SectionTitle title="آخر نشاط" />
          <p className="text-body text-on-dark-muted break-words">{status?.lastActivity ?? "—"}</p>
        </Card>
      </div>
    </>
  );
}
