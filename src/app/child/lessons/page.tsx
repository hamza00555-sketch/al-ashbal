/* Child lessons (/child/lessons) — today, upcoming, and attendance. */
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components";
import {
  getAttendanceForChild,
  getLessonsForChild,
  getNextLessonForChild,
} from "@/lib/data";
import { IconBook } from "../_icons";
import { ATTENDANCE_STATUS, getChildContext, LESSON_STATUS } from "../_shared";

export default function ChildLessonsPage() {
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const lessons = getLessonsForChild(viewer, child.id);
  const next = getNextLessonForChild(viewer, child.id);
  const attendance = getAttendanceForChild(viewer, child.id);

  const upcoming = lessons
    .filter((l) => l.status === "scheduled" || l.status === "live")
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  const past = lessons
    .filter((l) => l.status === "completed" || l.status === "cancelled")
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));

  return (
    <>
      <PageHeader title="الدروس" subtitle="حلقتك ومواعيدك" />

      <Card variant="gradient" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption text-on-dark-muted">درس اليوم</span>
          {next && <Badge tone={LESSON_STATUS[next.status].tone}>{LESSON_STATUS[next.status].label}</Badge>}
        </div>
        <h2 className="text-h2 break-words">{next?.title ?? "لا يوجد درس اليوم"}</h2>
        {next?.quranSegment && (
          <p className="text-body text-on-dark-muted break-words">القرآن: {next.quranSegment}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {next?.tajweedTopic && <Badge tone="neutral">تجويد: {next.tajweedTopic}</Badge>}
          {next?.behaviorTopic && <Badge tone="neutral">سلوك: {next.behaviorTopic}</Badge>}
        </div>
        <Button
          variant="primary"
          fullWidth
          disabled={!next}
          leadingIcon={<span className="inline-flex size-5"><IconBook /></span>}
        >
          ادخل الدرس
        </Button>
      </Card>

      <section className="flex flex-col gap-3">
        <SectionTitle title="الدروس القادمة" />
        {upcoming.length > 0 ? (
          upcoming.map((l) => (
            <Card key={l.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-card-title font-bold break-words">{l.title}</span>
                <span className="text-caption text-on-dark-muted">{l.date} · {l.startTime}</span>
              </div>
              <Badge tone={LESSON_STATUS[l.status].tone}>{LESSON_STATUS[l.status].label}</Badge>
            </Card>
          ))
        ) : (
          <Card><p className="text-body text-on-dark-muted">لا دروس قادمة حاليًا.</p></Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle title="الحضور" />
        {past.length > 0 ? (
          past.map((l) => {
            const record = attendance.find((a) => a.lessonId === l.id) ?? null;
            return (
              <Card key={l.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{l.title}</span>
                  <span className="text-caption text-on-dark-muted">{l.date}</span>
                </div>
                {record ? (
                  <Badge tone={ATTENDANCE_STATUS[record.status].tone}>
                    {ATTENDANCE_STATUS[record.status].label}
                  </Badge>
                ) : (
                  <Badge tone="neutral">—</Badge>
                )}
              </Card>
            );
          })
        ) : (
          <Card><p className="text-body text-on-dark-muted">لا سجلّ حضور بعد.</p></Card>
        )}
      </section>
    </>
  );
}
