"use client";

import { useState } from "react";
import { Badge, Button, Card, RecordingPlayer, SectionTitle } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import { updateSubmission, useSubmissions, type Submission } from "@/lib/demo/submissions";

function SubmissionCard({ sub }: { sub: Submission }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(sub.note ?? "");
  const resolved = sub.state === "accepted" || sub.state === "rerecord";

  function accept() {
    updateSubmission(sub.taskId, { state: "accepted" });
    pushNotification({ userId: sub.childUserId, title: "تم قبول تسميعك", body: "أحسنت! تم قبول تسميعك.", type: "review_accepted" });
    if (sub.parentUserId) {
      pushNotification({ userId: sub.parentUserId, title: "تم قبول تسميع الطفل", body: `قَبِل المعلم تسميع ${sub.childName}.`, type: "review_accepted" });
    }
  }
  function requestRerecord() {
    updateSubmission(sub.taskId, { state: "rerecord" });
    pushNotification({ userId: sub.childUserId, title: "المعلم طلب إعادة التسميع", body: "خلّينا نعيد التسميع بشكل أوضح.", type: "review_rerecord" });
    if (sub.parentUserId) {
      pushNotification({ userId: sub.parentUserId, title: "المعلم طلب إعادة التسميع", body: `طلب المعلم إعادة تسميع ${sub.childName}.`, type: "review_rerecord" });
    }
  }
  function saveNote() {
    const trimmed = note.trim();
    updateSubmission(sub.taskId, { note: trimmed || undefined });
    if (trimmed) {
      pushNotification({ userId: sub.childUserId, title: "لديك ملاحظة جديدة على التسميع", body: trimmed, type: "review_note" });
    }
    setNoteOpen(false);
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-card-title font-bold break-words">{sub.title}</span>
        <span className="text-caption text-on-dark-muted">{sub.childName} · {sub.recordingType === "video" ? "فيديو" : "صوت"}</span>
      </div>
      <RecordingPlayer recordingId={sub.recordingId} />
      {sub.note && <p className="text-caption text-on-dark-muted">ملاحظة: {sub.note}</p>}
      {resolved ? (
        <span>
          <Badge tone={sub.state === "accepted" ? "success" : "warning"}>
            {sub.state === "accepted" ? "تم قبول التسميع تجريبيًا" : "طلب المعلم إعادة التسميع تجريبيًا"}
          </Badge>
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={accept}>قبول التسميع</Button>
          <Button variant="danger" size="sm" onClick={requestRerecord}>طلب إعادة التسميع</Button>
          <Button variant="ghost" size="sm" onClick={() => setNoteOpen((v) => !v)}>إضافة ملاحظة</Button>
        </div>
      )}
      {noteOpen && !resolved && (
        <div className="flex flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ملاحظة للطفل / ولي الأمر"
            className="min-h-11 rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
          />
          <Button variant="secondary" size="sm" onClick={saveNote}>حفظ الملاحظة</Button>
        </div>
      )}
    </Card>
  );
}

/** Recorded recitations approved by the parent and awaiting THIS teacher's review. */
export function TeacherSubmissions({ teacherId }: { teacherId: string }) {
  const submissions = useSubmissions();
  const items = Object.values(submissions).filter(
    (s) => s.teacherId === teacherId && (s.state === "pending_teacher" || s.state === "accepted" || s.state === "rerecord"),
  );
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="تسميعات مُسجّلة" subtitle="معتمدة من ولي الأمر" />
      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((s) => (
          <SubmissionCard key={s.taskId} sub={s} />
        ))}
      </div>
    </section>
  );
}
