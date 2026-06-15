/*
  Teacher · attendance (/teacher/attendance) — today's lesson attendance.
  Statuses are editable as a mock (local state only); nothing is persisted.
*/
import { Badge, Card, PageHeader } from "@/components";
import { getAttendanceForLesson, getLessonsForTeacher } from "@/lib/data";
import type { AttendanceStatus } from "@/types";
import { getTeacherContext } from "../_shared";
import { AttendanceTable, type AttendanceRow } from "./AttendanceTable";

type EditableStatus = "present" | "late" | "absent";

function toEditable(status: AttendanceStatus | undefined): EditableStatus {
  if (status === "late") return "late";
  if (status === "absent") return "absent";
  return "present";
}

export default function TeacherAttendancePage() {
  const { viewer, children } = getTeacherContext();
  const lessons = getLessonsForTeacher(viewer);

  const todayLesson =
    lessons.find((l) => l.status === "live") ??
    lessons
      .filter((l) => l.status === "scheduled")
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0] ??
    lessons
      .filter((l) => l.status === "completed")
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))[0] ??
    null;

  const existing = todayLesson ? getAttendanceForLesson(viewer, todayLesson.id) : [];
  const rows: AttendanceRow[] = children.map((child) => ({
    childId: child.id,
    name: child.displayName,
    initial: toEditable(existing.find((a) => a.childId === child.id)?.status),
  }));

  return (
    <>
      <PageHeader
        title="الحضور"
        subtitle={todayLesson ? `${todayLesson.title} · ${todayLesson.date}` : "لا حلقة اليوم"}
      />
      <Card padded={false} className="p-4">
        {todayLesson ? (
          <AttendanceTable rows={rows} />
        ) : (
          <p className="text-body text-on-dark-muted">لا توجد حلقة لتسجيل حضورها الآن.</p>
        )}
      </Card>
      <div className="flex flex-wrap gap-2">
        <Badge tone="success">حاضر</Badge>
        <Badge tone="warning">متأخر</Badge>
        <Badge tone="danger">غائب</Badge>
      </div>
    </>
  );
}
