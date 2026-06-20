/*
  Teacher · attendance (/teacher/attendance) — gate-based attendance (mock).
  The roster is sourced from the halaqa ENROLLMENT store (empty-first): only
  children a parent enrolled with the halaqa code appear. The teacher opens/
  closes the gate; children join from /child/lessons (same browser, via
  localStorage). Manual override is available as a fallback. Nothing is
  persisted to a backend.
*/
import { Card, PageHeader } from "@/components";
import { getLessonsForTeacher } from "@/lib/data";
import { getTeacherContext } from "../_shared";
import { TeacherAttendanceRoster } from "./TeacherAttendanceRoster";

export default function TeacherAttendancePage() {
  const { viewer, halaqas } = getTeacherContext();
  const halaqa = halaqas[0] ?? null;
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

  // A stable attendance key for the demo: a real lesson id when available, else
  // a synthetic per-halaqa "today" key so the gate works without a seed lesson.
  const lessonId = todayLesson?.id ?? (halaqa ? `att-${halaqa.id}-today` : "att-none");

  return (
    <>
      <PageHeader
        title="الحضور"
        subtitle={todayLesson ? `${todayLesson.title} · ${todayLesson.date}` : "حضور حلقة اليوم"}
      />
      {halaqa ? (
        <TeacherAttendanceRoster
          halaqaId={halaqa.id}
          lessonId={lessonId}
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
