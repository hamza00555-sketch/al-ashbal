"use client";

import { Button, Card, RecordingPlayer, SectionTitle } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import { updateSubmission, useSubmissions } from "@/lib/demo/submissions";

/** Recorded recitations awaiting THIS parent's approval (real recording players). */
export function ParentSubmissions({ parentUserId }: { parentUserId: string }) {
  const submissions = useSubmissions();
  const pending = Object.values(submissions).filter(
    (s) => s.parentUserId === parentUserId && s.state === "pending_parent",
  );

  if (pending.length === 0) return null;

  function approve(taskId: string, childUserId: string, teacherId: string | undefined, childName: string) {
    updateSubmission(taskId, { state: "pending_teacher" });
    pushNotification({ userId: childUserId, title: "تم إرسال تسميعك للمعلم", body: "وافق ولي أمرك وأرسله للمعلم.", type: "video_approved" });
    if (teacherId) {
      pushNotification({ userId: teacherId, title: "تسميع جديد بانتظار المراجعة", body: `تسميع ${childName} معتمَد من ولي الأمر.`, type: "video_pending_teacher" });
    }
  }
  function rerecord(taskId: string, childUserId: string) {
    updateSubmission(taskId, { state: "rerecord" });
    pushNotification({ userId: childUserId, title: "ولي الأمر طلب إعادة تسجيل التسميع", body: "خلّينا نعيد التسجيل بشكل أوضح.", type: "rerecord" });
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="تسميعات بانتظار موافقتك" subtitle="تسجيلات على هذا الجهاز" />
      <div className="grid gap-6 lg:grid-cols-2">
        {pending.map((s) => (
          <Card key={s.taskId} className="flex flex-col gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-card-title font-bold break-words">{s.title}</span>
              <span className="text-caption text-on-dark-muted">{s.childName} · {s.recordingType === "video" ? "فيديو" : "صوت"}</span>
            </div>
            <RecordingPlayer recordingId={s.recordingId} />
            <p className="text-caption text-on-dark-muted">
              راجع التسجيل قبل إرساله للمعلم. (تسجيل محفوظ على هذا الجهاز فقط)
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => approve(s.taskId, s.childUserId, s.teacherId, s.childName)}>
                موافقة
              </Button>
              <Button variant="danger" size="sm" onClick={() => rerecord(s.taskId, s.childUserId)}>
                إعادة التسجيل
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
