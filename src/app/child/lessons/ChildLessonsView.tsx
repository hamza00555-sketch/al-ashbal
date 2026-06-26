"use client";

import { Badge, Card, SectionTitle } from "@/components";
import { usePrepsForHalaqa, type LessonPrep } from "@/lib/demo/lessonPrep";
import { useChildActiveHalaqaId } from "@/lib/demo/halaqaEnrollment";
import { JoinLessonButton } from "./JoinLessonButton";

/** Compact lesson card (material · topic · ayah · short note). Small by design. */
function LessonChip({ prep }: { prep: LessonPrep }) {
  const range = prep.ayahFrom && prep.ayahTo ? ` ${prep.ayahFrom}-${prep.ayahTo}` : "";
  return (
    <Card className="flex flex-col gap-1.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge tone="purple">{prep.subject}</Badge>
        {prep.lessonDate && <span className="text-caption text-on-dark-muted">{prep.lessonDate}</span>}
      </div>
      <span className="text-card-title font-bold break-words">
        {prep.surahOrTopic || prep.title || "درس"}{range}
      </span>
      {prep.studentNotes && (
        <span className="text-caption text-on-dark-muted break-words">{prep.studentNotes}</span>
      )}
    </Card>
  );
}

/**
 * Child lessons page content. Today's lesson cards (compact) come from the
 * teacher's prep; the attendance gate is the BIG, primary action below them.
 * No student tasks here — tasks live in /child/tasks.
 */
export function ChildLessonsView({ halaqaId, childId }: { halaqaId: string; childId: string }) {
  // Lessons come from the child's ACTIVE (enrolled) halaqa; seed is only fallback.
  const activeHalaqaId = useChildActiveHalaqaId(childId, halaqaId);
  const preps = usePrepsForHalaqa(activeHalaqaId);
  const today = preps.filter((p) => p.lessonStatus === "today");
  const upcoming = preps.filter((p) => p.lessonStatus === "upcoming");
  const gateLessonId = today[0]?.lessonId;

  return (
    <>
      {/* Today's lesson — compact cards */}
      <section className="flex flex-col gap-3">
        <SectionTitle title="درس اليوم" subtitle="من تحضير المعلم" />
        {today.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {today.map((p) => (
              <LessonChip key={p.lessonId} prep={p} />
            ))}
          </div>
        ) : (
          <Card className="p-4"><p className="text-body text-on-dark-muted">لا يوجد درس محدد اليوم.</p></Card>
        )}
      </section>

      {/* Attendance gate — the big, clear primary action */}
      <Card variant="gradient" className="flex flex-col gap-3">
        <SectionTitle title="حضور الحلقة" subtitle="دخول الدرس وتسجيل الحضور" />
        <JoinLessonButton lessonId={gateLessonId} childId={childId} disabled={!gateLessonId} />
      </Card>

      {/* Upcoming lessons — compact */}
      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle title="دروس قادمة" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((p) => (
              <LessonChip key={p.lessonId} prep={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
