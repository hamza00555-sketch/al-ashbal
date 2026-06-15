/*
  Teacher · attendance (/teacher/attendance) — gate-based attendance (mock).
  The teacher opens/closes the gate; children join from /child/lessons (same
  browser, via localStorage). Manual override is available as a fallback.
  Mobile shows cards; md+ shows a table. Nothing is persisted to a backend.
*/
import { Card, PageHeader } from "@/components";
import { getLessonsForTeacher } from "@/lib/data";
import { getTeacherContext } from "../_shared";
import { AttendanceManager, type AttendanceChild } from "./AttendanceManager";

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

  const childrenList: AttendanceChild[] = children.map((c) => ({ id: c.id, name: c.displayName }));

  return (
    <>
      <PageHeader
        title="الحضور"
        subtitle={todayLesson ? `${todayLesson.title} · ${todayLesson.date}` : "لا حلقة اليوم"}
      />
      {todayLesson ? (
        <AttendanceManager
          lessonId={todayLesson.id}
          childrenList={childrenList}
          teacherId={viewer.id}
          teacherName={viewer.displayName}
        />
      ) : (
        <Card>
          <p className="text-body text-on-dark-muted">لا توجد حلقة لتسجيل حضورها الآن.</p>
        </Card>
      )}
    </>
  );
}
