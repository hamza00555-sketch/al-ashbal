"use client";

import { useEffect } from "react";
import { Badge, Button, Card, RecordingPlayer, SectionTitle } from "@/components";
import { cn } from "@/lib/cn";
import { pushNotification } from "@/lib/demo/notifications";
import { updateSubmission, useSubmissions, type Submission } from "@/lib/demo/submissions";

/** Recorded recitations awaiting THIS parent's approval (real recording players). */
export function ParentSubmissions({
  parentUserId,
  highlightSubmissionId,
}: {
  parentUserId: string;
  highlightSubmissionId?: string;
}) {
  const submissions = useSubmissions();
  const pending = Object.values(submissions).filter(
    (s) => s.parentUserId === parentUserId && s.state === "pending_parent",
  );

  useEffect(() => {
    if (!highlightSubmissionId) return;
    const el = document.getElementById(`submission-${highlightSubmissionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightSubmissionId, pending.length]);

  if (pending.length === 0) return null;

  function approve(s: Submission) {
    updateSubmission(s.taskId, { state: "pending_teacher" });
    pushNotification({
      userId: s.childUserId,
      title: "تم إرسال تسميعك للمعلم",
      body: "وافق ولي أمرك وأرسله للمعلم.",
      type: "video_approved",
      href: `/child/tasks?taskId=${s.taskId}`,
    });
    if (s.teacherId) {
      pushNotification({
        userId: s.teacherId,
        title: "تسميع جديد بانتظار المراجعة",
        body: `تسميع ${s.childName} معتمَد من ولي الأمر.`,
        type: "video_pending_teacher",
        href: `/teacher/reviews?submissionId=${s.id}`,
      });
    }
  }
  function rerecord(s: Submission) {
    updateSubmission(s.taskId, { state: "rerecord" });
    pushNotification({
      userId: s.childUserId,
      title: "ولي الأمر طلب إعادة تسجيل التسميع",
      body: "خلّينا نعيد التسجيل بشكل أوضح.",
      type: "rerecord",
      href: `/child/tasks?taskId=${s.taskId}`,
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="تسميعات بانتظار موافقتك" subtitle="تسجيلات على هذا الجهاز" />
      <div className="grid gap-6 lg:grid-cols-2">
        {pending.map((s) => {
          const highlighted = s.id === highlightSubmissionId;
          return (
            <Card
              key={s.taskId}
              id={`submission-${s.id}`}
              className={cn(
                "flex flex-col gap-3",
                highlighted && "ring-2 ring-purple-soft",
              )}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-card-title font-bold break-words">{s.title}</span>
                <span className="text-caption text-on-dark-muted">{s.childName} · {s.recordingType === "video" ? "فيديو" : "صوت"}</span>
              </div>
              {highlighted && (
                <span>
                  <Badge tone="purple">وصلت من الإشعار</Badge>
                </span>
              )}
              <RecordingPlayer recordingId={s.recordingId} />
              <p className="text-caption text-on-dark-muted">
                راجع التسجيل قبل إرساله للمعلم. (تسجيل محفوظ على هذا الجهاز فقط)
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={() => approve(s)}>
                  موافقة
                </Button>
                <Button variant="danger" size="sm" onClick={() => rerecord(s)}>
                  إعادة التسجيل
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
