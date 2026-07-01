"use client";

import { useState } from "react";
import { AppAssetIcon, Badge, Button, Card, SectionTitle } from "@/components";
import {
  lessonPrepTaskTitle,
  REQUIREMENT_LABEL,
  SUBMISSION_LABEL,
  usePrepsForHalaqa,
  type LessonPrep,
  type RequirementType,
} from "@/lib/demo/lessonPrep";

import { IconBook, IconTasks, IconVideo } from "../_icons";
import { RecitationTaskAction } from "./RecitationTaskAction";

const PREP_ICON: Record<RequirementType, { name: string; fallback: React.ReactNode }> = {
  recitation: { name: "icon_record_video", fallback: <IconVideo /> },
  memorization: { name: "icon_tasks", fallback: <IconTasks /> },
  review: { name: "icon_review", fallback: <IconBook /> },
  reading: { name: "icon_lessons", fallback: <IconBook /> },
  none: { name: "icon_tasks", fallback: <IconTasks /> },
};

export interface PrepTasksProps {
  halaqaId: string;
  childId: string;
  childName: string;
  childUserId: string;
  parentUserId: string;
  teacherId?: string;
}

function needsRecording(prep: LessonPrep): boolean {
  return (
    prep.submissionType === "audio" ||
    prep.submissionType === "video" ||
    prep.submissionType === "audio_or_video"
  );
}

function PrepTaskCard({ prep, ctx }: { prep: LessonPrep; ctx: PrepTasksProps }) {
  const [message, setMessage] = useState<string | null>(null);
  const title = lessonPrepTaskTitle(prep);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <AppAssetIcon
          src={`/assets/icons/${PREP_ICON[prep.requirementType].name}.png`}
          size="md"
          className="rounded-full bg-purple/15 text-purple-soft"
          fallback={PREP_ICON[prep.requirementType].fallback}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-card-title font-bold break-words">{title}</span>
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple">من التحضير</Badge>
            <Badge tone="neutral">{REQUIREMENT_LABEL[prep.requirementType]}</Badge>
            <Badge tone="neutral">طريقة التسليم: {SUBMISSION_LABEL[prep.submissionType]}</Badge>
            {prep.dueLabel && <Badge tone="neutral">{prep.dueLabel}</Badge>}
          </div>
        </div>
      </div>
      {prep.studentNotes && <p className="text-body text-on-dark-muted break-words">{prep.studentNotes}</p>}

      {needsRecording(prep) ? (
        <RecitationTaskAction
          taskId={prep.lessonId}
          childId={ctx.childId}
          childName={ctx.childName}
          childUserId={ctx.childUserId}
          parentUserId={ctx.parentUserId}
          teacherId={ctx.teacherId}
          title={title}
          allowAudio={prep.submissionType === "audio" || prep.submissionType === "audio_or_video"}
          allowVideo={prep.submissionType === "video" || prep.submissionType === "audio_or_video"}
          baseCanRecord
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="sm:max-w-xs">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setMessage("سيتم تفعيل تنفيذ المهمة في خطوة لاحقة.")}
            >
              ابدأ المهمة
            </Button>
          </div>
          {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        </div>
      )}
    </Card>
  );
}

/** Tasks derived from the teacher's saved prep (for the child's halaqa only). */
export function PrepTasks(props: PrepTasksProps) {
  // Single-class model: the passed halaqaId IS the child's class.
  const activeHalaqaId = props.halaqaId;
  const preps = usePrepsForHalaqa(activeHalaqaId).filter((p) => p.requirementType !== "none");
  if (preps.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="مهام من تحضير المعلم" />
      <div className="grid gap-4 lg:grid-cols-2">
        {preps.map((p) => (
          <PrepTaskCard key={p.lessonId} prep={p} ctx={props} />
        ))}
      </div>
    </section>
  );
}
