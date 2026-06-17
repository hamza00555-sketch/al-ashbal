"use client";

import { useState } from "react";
import { AppAssetIcon, Badge, Button, Card, SectionTitle } from "@/components";
import {
  ASSIGNMENT_SUBMISSION_LABEL,
  ASSIGNMENT_TYPE_LABEL,
  useAssignmentsForHalaqa,
  type AssignmentType,
  type StudentAssignment,
} from "@/lib/demo/studentAssignments";
import { IconBook, IconTasks, IconVideo } from "../_icons";
import { RecitationTaskAction } from "./RecitationTaskAction";

const ASSIGNMENT_ICON: Record<AssignmentType, { name: string; fallback: React.ReactNode }> = {
  recitation: { name: "icon_record_video", fallback: <IconVideo /> },
  memorization: { name: "icon_tasks", fallback: <IconTasks /> },
  review: { name: "icon_review", fallback: <IconBook /> },
  reading: { name: "icon_lessons", fallback: <IconBook /> },
  confirm: { name: "icon_tasks", fallback: <IconTasks /> },
};

export interface StudentAssignmentTasksProps {
  halaqaId: string;
  childId: string;
  childName: string;
  childUserId: string;
  parentUserId: string;
  teacherId?: string;
}

function needsRecording(a: StudentAssignment): boolean {
  return (
    a.submissionType === "audio" ||
    a.submissionType === "video" ||
    a.submissionType === "audio_or_video"
  );
}

function AssignmentCard({ a, ctx }: { a: StudentAssignment; ctx: StudentAssignmentTasksProps }) {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <AppAssetIcon
          src={`/assets/icons/${ASSIGNMENT_ICON[a.type].name}.png`}
          size="md"
          className="rounded-full bg-purple/15 text-purple-soft"
          fallback={ASSIGNMENT_ICON[a.type].fallback}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-card-title font-bold break-words">{a.title}</span>
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple">مهمة من المعلم</Badge>
            <Badge tone="neutral">{ASSIGNMENT_TYPE_LABEL[a.type]}</Badge>
            <Badge tone="neutral">طريقة التسليم: {ASSIGNMENT_SUBMISSION_LABEL[a.submissionType]}</Badge>
            {a.dueLabel && <Badge tone="neutral">{a.dueLabel}</Badge>}
          </div>
        </div>
      </div>
      {a.description && <p className="text-body text-on-dark-muted break-words">{a.description}</p>}

      {needsRecording(a) ? (
        // Recording assignments flow through the SAME submission → parent approval
        // → teacher review pipeline as every other recitation task (keyed by id).
        <RecitationTaskAction
          taskId={a.id}
          childId={ctx.childId}
          childName={ctx.childName}
          childUserId={ctx.childUserId}
          parentUserId={ctx.parentUserId}
          teacherId={ctx.teacherId}
          title={a.title}
          allowAudio={a.submissionType === "audio" || a.submissionType === "audio_or_video"}
          allowVideo={a.submissionType === "video" || a.submissionType === "audio_or_video"}
          baseCanRecord
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="sm:max-w-xs">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setMessage("سيتم تفعيل تنفيذ هذا النوع من المهام في خطوة لاحقة.")}
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

/** Active student assignments for the child's halaqa (independent of lesson prep). */
export function StudentAssignmentTasks(props: StudentAssignmentTasksProps) {
  const assignments = useAssignmentsForHalaqa(props.halaqaId).filter((a) => a.status === "active");
  if (assignments.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="مهام من المعلم" />
      <div className="grid gap-4 lg:grid-cols-2">
        {assignments.map((a) => (
          <AssignmentCard key={a.id} a={a} ctx={props} />
        ))}
      </div>
    </section>
  );
}
