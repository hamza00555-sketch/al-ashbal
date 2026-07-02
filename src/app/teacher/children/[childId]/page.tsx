/*
  Teacher · child detail (/teacher/children/[childId]) — Phase 01 · Task A6.
  One child of the teacher's halaqa only. Gated by getChildById; a teacher can
  never view a child outside their halaqa. Quick points live in a demo store.
*/
import { Avatar, Badge, Card, PageHeader, ProgressRing, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import {
  getAttendanceForChild,
  getChildById,
  getChildStatusSummary,
  getProgressForChild,
  getRecitationsForViewer,
  getTeacherReviewsForChild,
} from "@/lib/data";
import { ATTENDANCE_STATUS, CHILD_STATUS, getTeacherContext, RECITATION_STATUS } from "../../_shared";
import { TeacherChildPoints } from "./TeacherChildPoints";

// No generateStaticParams here: teacher pages are auth-gated per request
// (cookies), so nothing under /teacher may be prerendered at build time.

export default async function TeacherChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const { viewer } = getTeacherContext();
  const child = getChildById(viewer, childId);

  if (!child) {
    return (
      <>
        <PageHeader title="تفاصيل الطالب" />
        <Card>
          <p className="text-body text-on-dark-muted">لا يمكنك عرض بيانات هذا الطالب.</p>
        </Card>
      </>
    );
  }

  const status = getChildStatusSummary(viewer, child.id);
  const level = status?.level ?? "follow_up";
  const progress = getProgressForChild(viewer, child.id);
  const attendance = getAttendanceForChild(viewer, child.id);
  const latestAttendance = attendance[attendance.length - 1] ?? null;
  const recitations = getRecitationsForViewer(viewer, child.id);
  const lastRecitation = recitations[recitations.length - 1] ?? null;
  const reviews = getTeacherReviewsForChild(viewer, child.id);
  const lastReview = reviews[reviews.length - 1] ?? null;
  const teacherNote = lastReview?.teacherNote ?? lastReview?.behaviorNote ?? null;

  return (
    <>
      <PageHeader
        eyebrow="تفاصيل الطالب"
        title={child.displayName}
        leading={<Avatar name={child.displayName} size="profile" src={childAvatarSrc(child.gender)} />}
        actions={<Badge tone={CHILD_STATUS[level].tone}>{CHILD_STATUS[level].label}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress */}
        <Card className="flex flex-col items-center gap-3">
          <SectionTitle title="التقدّم العام" className="w-full" />
          <ProgressRing value={status?.progressPercent ?? 0} size={120} strokeWidth={12} tone="purple" />
          <div className="flex flex-wrap justify-center gap-2">
            <Badge tone="purple">قرآن {progress?.quranPercent ?? 0}%</Badge>
            <Badge tone="gold">تجويد {progress?.tajweedPercent ?? 0}%</Badge>
            <Badge tone="success">سلوك {progress?.behaviorPercent ?? 0}%</Badge>
          </div>
        </Card>

        {/* Summary */}
        <Card className="flex flex-col gap-3 lg:col-span-2">
          <SectionTitle title="ملخص" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body text-on-dark-muted">آخر حضور:</span>
            {latestAttendance ? (
              <Badge tone={ATTENDANCE_STATUS[latestAttendance.status].tone}>
                {ATTENDANCE_STATUS[latestAttendance.status].label}
              </Badge>
            ) : (
              <Badge tone="neutral">—</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body text-on-dark-muted">آخر تسميع:</span>
            {lastRecitation ? (
              <Badge tone={RECITATION_STATUS[lastRecitation.status].tone}>
                {lastRecitation.title} · {RECITATION_STATUS[lastRecitation.status].label}
              </Badge>
            ) : (
              <span className="text-body text-on-dark-muted">لا تسميعات بعد.</span>
            )}
          </div>
          <p className="text-body text-on-dark-muted break-words">
            آخر نشاط: {status?.lastActivity ?? "—"}
          </p>
          {teacherNote && (
            <p className="text-caption text-on-dark-muted break-words">ملاحظة سابقة: {teacherNote}</p>
          )}
        </Card>

        {/* Points (demo store, client) */}
        <TeacherChildPoints
          target={{
            childId: child.id,
            childName: child.displayName,
            childUserId: child.userId ?? "",
            parentUserIds: child.parentIds,
            halaqaId: child.halaqaId,
            teacherId: viewer.id,
            teacherName: viewer.displayName,
          }}
          baseLevel={level}
        />
      </div>
    </>
  );
}
