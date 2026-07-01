"use client";

import { useState } from "react";
import { Badge, type BadgeTone, Button } from "@/components";
import { submissionKey, useSubmissions, type SubmissionState } from "@/lib/demo/submissions";
import { RecordTaskModal } from "./RecordTaskModal";

const SUB_LABEL: Record<SubmissionState, { label: string; tone: BadgeTone }> = {
  pending_parent: { label: "بانتظار موافقة ولي الأمر", tone: "warning" },
  pending_teacher: { label: "بانتظار مراجعة المعلم", tone: "purple" },
  accepted: { label: "مقبول", tone: "success" },
  rerecord: { label: "مطلوب إعادة", tone: "danger" },
};

export interface RecitationTaskActionProps {
  taskId: string;
  childId: string;
  childName: string;
  childUserId: string;
  parentUserId: string;
  teacherId?: string;
  title: string;
  allowAudio: boolean;
  allowVideo: boolean;
  /** When there is no submission yet: whether the base (mock) status allows recording. */
  baseCanRecord: boolean;
  baseStatusLabel?: string;
  baseStatusTone?: BadgeTone;
  /** Optional material/lesson link (Phase D) — passed through to the submission. */
  materialId?: string;
  lessonId?: string;
  points?: number;
  materialName?: string;
  lessonTitle?: string;
}

export function RecitationTaskAction(props: RecitationTaskActionProps) {
  const { taskId, baseCanRecord, baseStatusLabel, baseStatusTone } = props;
  const [open, setOpen] = useState(false);
  const submissions = useSubmissions();
  // Per-child lookup: a sibling's submission on the same task never blocks this child.
  const sub = submissions[submissionKey(taskId, props.childId)];

  // Decide what to show.
  let badge: { label: string; tone: BadgeTone } | null = null;
  let canRecord = false;
  let recordLabel = "سجّل التسميع";

  if (sub) {
    if (sub.state === "rerecord") {
      badge = SUB_LABEL.rerecord;
      canRecord = true;
      recordLabel = "إعادة التسجيل";
    } else {
      badge = SUB_LABEL[sub.state];
    }
  } else if (baseCanRecord) {
    canRecord = true;
  } else if (baseStatusLabel) {
    badge = { label: baseStatusLabel, tone: baseStatusTone ?? "neutral" };
  }

  return (
    <div className="flex flex-col gap-2">
      {badge && (
        <span>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </span>
      )}
      {canRecord && (
        <div className="sm:max-w-xs">
          <Button variant="primary" size="sm" fullWidth onClick={() => setOpen(true)}>
            {recordLabel}
          </Button>
        </div>
      )}
      {open && (
        <RecordTaskModal
          task={{
            taskId: props.taskId,
            childId: props.childId,
            childName: props.childName,
            childUserId: props.childUserId,
            parentUserId: props.parentUserId,
            teacherId: props.teacherId,
            title: props.title,
            materialId: props.materialId,
            lessonId: props.lessonId,
            points: props.points,
            materialName: props.materialName,
            lessonTitle: props.lessonTitle,
          }}
          allowAudio={props.allowAudio}
          allowVideo={props.allowVideo}
          onClose={() => setOpen(false)}
          onSent={() => setOpen(false)}
        />
      )}
    </div>
  );
}
