"use client";

import { Badge, Card, SectionTitle } from "@/components";
import {
  lessonPrepTitle,
  REQUIREMENT_LABEL,
  SUBMISSION_LABEL,
  usePrepsForHalaqa,
  type LessonPrep,
} from "@/lib/demo/lessonPrep";

function PrepLessonCard({ prep, variant }: { prep: LessonPrep; variant: "gradient" | "surface" }) {
  return (
    <Card variant={variant} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-on-dark-muted">
          {prep.lessonStatus === "today" ? "درس اليوم" : prep.lessonDate}
        </span>
        <Badge tone="neutral">{prep.subject}</Badge>
      </div>
      <h3 className="text-card-title font-bold break-words">{lessonPrepTitle(prep)}</h3>
      {prep.objective && <p className="text-body text-on-dark-muted break-words">الهدف: {prep.objective}</p>}
      {prep.studentNotes && <p className="text-caption text-on-dark-muted break-words">{prep.studentNotes}</p>}
      {prep.requirementType !== "none" && (
        <div className="flex flex-wrap gap-2">
          <Badge tone="purple">المطلوب: {REQUIREMENT_LABEL[prep.requirementType]}</Badge>
          <Badge tone="neutral">{SUBMISSION_LABEL[prep.submissionType]}</Badge>
          {prep.dueLabel && <Badge tone="neutral">{prep.dueLabel}</Badge>}
        </div>
      )}
    </Card>
  );
}

/** Lessons from the teacher's saved prep (for the child's halaqa only). */
export function PrepLessons({ halaqaId }: { halaqaId: string }) {
  const preps = usePrepsForHalaqa(halaqaId);
  if (preps.length === 0) return null;

  const today = preps.filter((p) => p.lessonStatus === "today");
  const upcoming = preps.filter((p) => p.lessonStatus === "upcoming");

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="من تحضير المعلم" subtitle="درس اليوم والدروس القادمة" />
      {today.map((p) => (
        <PrepLessonCard key={p.lessonId} prep={p} variant="gradient" />
      ))}
      {upcoming.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {upcoming.map((p) => (
            <PrepLessonCard key={p.lessonId} prep={p} variant="surface" />
          ))}
        </div>
      )}
    </section>
  );
}
