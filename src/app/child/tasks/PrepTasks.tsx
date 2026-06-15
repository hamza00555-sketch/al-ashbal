"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import {
  lessonPrepTaskTitle,
  REQUIREMENT_LABEL,
  SUBMISSION_LABEL,
  usePrepsForHalaqa,
  type LessonPrep,
} from "@/lib/demo/lessonPrep";

function PrepTaskCard({ prep }: { prep: LessonPrep }) {
  const [message, setMessage] = useState<string | null>(null);
  const needsRecording = prep.submissionType !== "none";
  const label = prep.requirementType === "recitation" ? "سجّل التسميع" : "ابدأ المهمة";

  function handleClick() {
    setMessage(
      needsRecording
        ? "سيتم تفعيل تسجيل الصوت والفيديو في خطوة لاحقة."
        : "سيتم تفعيل تنفيذ المهمة في خطوة لاحقة.",
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-card-title font-bold break-words">{lessonPrepTaskTitle(prep)}</span>
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple">من التحضير</Badge>
            <Badge tone="neutral">{REQUIREMENT_LABEL[prep.requirementType]}</Badge>
            <Badge tone="neutral">طريقة التسليم: {SUBMISSION_LABEL[prep.submissionType]}</Badge>
            {prep.dueLabel && <Badge tone="neutral">{prep.dueLabel}</Badge>}
          </div>
        </div>
        <Badge tone="neutral">لم يبدأ</Badge>
      </div>
      {prep.studentNotes && <p className="text-body text-on-dark-muted break-words">{prep.studentNotes}</p>}
      <div className="sm:max-w-xs">
        <Button variant="primary" size="sm" fullWidth onClick={handleClick}>{label}</Button>
      </div>
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
    </Card>
  );
}

/** Tasks derived from the teacher's saved prep (for the child's halaqa only). */
export function PrepTasks({ halaqaId }: { halaqaId: string }) {
  const preps = usePrepsForHalaqa(halaqaId).filter((p) => p.requirementType !== "none");
  if (preps.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="مهام من تحضير المعلم" />
      <div className="grid gap-4 lg:grid-cols-2">
        {preps.map((p) => (
          <PrepTaskCard key={p.lessonId} prep={p} />
        ))}
      </div>
    </section>
  );
}
