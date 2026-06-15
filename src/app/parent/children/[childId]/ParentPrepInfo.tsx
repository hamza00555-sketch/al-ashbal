"use client";

import { Badge, Card, SectionTitle } from "@/components";
import {
  lessonPrepTaskTitle,
  lessonPrepTitle,
  SUBMISSION_LABEL,
  usePrepsForHalaqa,
} from "@/lib/demo/lessonPrep";

/** Surfaces the teacher's saved prep (lesson + requirements) on the child detail. */
export function ParentPrepInfo({ halaqaId }: { halaqaId: string }) {
  const preps = usePrepsForHalaqa(halaqaId);
  if (preps.length === 0) return null;

  const lesson = preps.find((p) => p.lessonStatus === "today") ?? preps[0];
  const tasks = preps.filter((p) => p.requirementType !== "none");

  return (
    <Card className="flex flex-col gap-3 lg:col-span-3">
      <SectionTitle title="من تحضير المعلم" />
      <div className="flex flex-col gap-1">
        <span className="text-caption text-on-dark-muted">
          {lesson.lessonStatus === "today" ? "درس اليوم" : "الدرس القادم"}
        </span>
        <span className="text-body break-words">
          {lessonPrepTitle(lesson)} — {lesson.subject}
        </span>
        {lesson.objective && (
          <span className="text-caption text-on-dark-muted break-words">الهدف: {lesson.objective}</span>
        )}
      </div>
      {tasks.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-caption text-on-dark-muted">المطلوب من الطلاب</span>
          {tasks.map((p) => (
            <div key={p.lessonId} className="flex flex-wrap items-center gap-2">
              <span className="text-body break-words">{lessonPrepTaskTitle(p)}</span>
              <Badge tone="neutral">{SUBMISSION_LABEL[p.submissionType]}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
