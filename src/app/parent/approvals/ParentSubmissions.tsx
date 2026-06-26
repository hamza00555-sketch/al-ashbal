"use client";

import { useEffect } from "react";
import { AppAssetIcon, Avatar, Badge, Button, Card, RecordingPlayer, SectionTitle } from "@/components";
import { cn } from "@/lib/cn";
import { childAvatarById } from "@/lib/avatars";
import { pushNotification } from "@/lib/demo/notifications";
import { updateSubmission, useSubmissions, type Submission } from "@/lib/demo/submissions";
import { IconVideo } from "../_icons";

/**
 * Recorded recitations for THIS parent.
 * - mode="pending"  → awaiting the parent's decision (action buttons). Shown on top.
 * - mode="processed"→ already approved (sent to teacher) or sent back for re-record.
 *   Shown read-only at the BOTTOM so acted items move down instead of vanishing.
 */
export function ParentSubmissions({
  parentUserId,
  highlightSubmissionId,
  mode = "pending",
}: {
  parentUserId: string;
  highlightSubmissionId?: string;
  mode?: "pending" | "processed";
}) {
  const submissions = useSubmissions();
  const mine = Object.values(submissions).filter((s) => s.parentUserId === parentUserId);
  const list =
    mode === "pending"
      ? mine.filter((s) => s.state === "pending_parent")
      : mine.filter((s) => s.state === "pending_teacher" || s.state === "rerecord");

  useEffect(() => {
    if (mode !== "pending" || !highlightSubmissionId) return;
    const el = document.getElementById(`submission-${highlightSubmissionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mode, highlightSubmissionId, list.length]);

  if (list.length === 0) return null;

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

  const heading =
    mode === "pending"
      ? { title: "تسميعات بانتظار موافقتك", subtitle: "تسجيلات على هذا الجهاز" }
      : { title: "تمت مراجعتها", subtitle: "تسميعات اتخذت قرارك فيها" };

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title={heading.title} subtitle={heading.subtitle} />
      <div className="grid gap-6 lg:grid-cols-2">
        {list.map((s) => {
          const highlighted = mode === "pending" && s.id === highlightSubmissionId;
          return (
            <Card
              key={s.taskId}
              id={`submission-${s.id}`}
              className={cn(
                "anim-rise flex flex-col gap-3",
                mode === "pending" && "anim-pulse-ring",
                highlighted && "ring-2 ring-purple-soft",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar name={s.childName} size="lg" src={childAvatarById(s.childId)} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{s.title}</span>
                  <span className="text-caption text-on-dark-muted">{s.childName} · {s.recordingType === "video" ? "فيديو" : "صوت"}</span>
                </div>
                <AppAssetIcon
                  src={`/assets/icons/${s.recordingType === "video" ? "icon_record_video" : "icon_record_audio"}.png`}
                  size="sm"
                  className="shrink-0 text-purple-soft"
                  fallback={<IconVideo />}
                />
              </div>
              {highlighted && (
                <span>
                  <Badge tone="purple">وصلت من الإشعار</Badge>
                </span>
              )}
              <RecordingPlayer recordingId={s.recordingId} />
              {mode === "pending" ? (
                <>
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
                </>
              ) : (
                <span>
                  <Badge tone={s.state === "pending_teacher" ? "success" : "warning"}>
                    {s.state === "pending_teacher" ? "تمت الموافقة — أُرسل للمعلم" : "طلبت إعادة التسجيل"}
                  </Badge>
                </span>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
