/*
  Teacher · children (/teacher/children) — table of the teacher's halaqa only.
  Shows attendance + Quran/Tajweed/Behavior + last activity. NEVER wishes.
*/
import { Avatar, Badge, Card, PageHeader } from "@/components";
import {
  getAttendanceForLesson,
  getLessonsForTeacher,
  getProgressForChild,
  getRecitationsForViewer,
} from "@/lib/data";
import { ATTENDANCE_STATUS, getTeacherContext, RECITATION_STATUS } from "../_shared";

export default function TeacherChildrenPage() {
  const { viewer, children } = getTeacherContext();
  const lessons = getLessonsForTeacher(viewer);
  const lastLesson =
    lessons
      .filter((l) => l.status === "completed")
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))[0] ??
    null;
  const attendance = lastLesson ? getAttendanceForLesson(viewer, lastLesson.id) : [];

  const rows = children.map((child) => {
    const progress = getProgressForChild(viewer, child.id);
    const record = attendance.find((a) => a.childId === child.id) ?? null;
    const lastRecitation = getRecitationsForViewer(viewer, child.id)[0] ?? null;
    return { child, progress, record, lastRecitation };
  });

  const th = "p-4 text-start text-caption font-bold text-on-dark-muted whitespace-nowrap";
  const td = "p-4 align-middle whitespace-nowrap";

  return (
    <>
      <PageHeader title="أطفال الحلقة" subtitle={`${children.length} طفلًا في حلقتك`} />

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-body">
            <thead>
              <tr className="border-b border-white/10">
                <th className={th}>الطفل</th>
                <th className={th}>الحضور</th>
                <th className={th}>القرآن</th>
                <th className={th}>التجويد</th>
                <th className={th}>السلوك</th>
                <th className={th}>آخر نشاط</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ child, progress, record, lastRecitation }) => (
                <tr key={child.id} className="border-b border-white/5 last:border-0">
                  <td className={td}>
                    <span className="flex items-center gap-3">
                      <Avatar name={child.displayName} size="sm" />
                      <span className="font-bold">{child.displayName}</span>
                    </span>
                  </td>
                  <td className={td}>
                    {record ? (
                      <Badge tone={ATTENDANCE_STATUS[record.status].tone}>
                        {ATTENDANCE_STATUS[record.status].label}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">—</Badge>
                    )}
                  </td>
                  <td className={td}>{progress?.quranPercent ?? 0}%</td>
                  <td className={td}>{progress?.tajweedPercent ?? 0}%</td>
                  <td className={td}>{progress?.behaviorPercent ?? 0}%</td>
                  <td className={td}>
                    {lastRecitation ? (
                      <Badge tone={RECITATION_STATUS[lastRecitation.status].tone}>
                        {RECITATION_STATUS[lastRecitation.status].label}
                      </Badge>
                    ) : (
                      <span className="text-on-dark-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
