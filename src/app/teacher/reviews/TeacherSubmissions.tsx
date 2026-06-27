"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Modal, RecordingPlayer, SectionTitle } from "@/components";
import { cn } from "@/lib/cn";
import { pushNotification } from "@/lib/demo/notifications";
import { recordSourcedPoints } from "@/lib/demo/points";
import { updateSubmission, useSubmissions, type Submission } from "@/lib/demo/submissions";

interface RecitationRating {
  label: string;
  value: number;
  reason: string;
}
const RECITATION_RATINGS: RecitationRating[] = [
  { label: "ممتاز — +5 نقاط", value: 5, reason: "تسميع ممتاز" },
  { label: "جيد — +3 نقاط", value: 3, reason: "تسميع جيد" },
  { label: "مقبول — +1 نقطة", value: 1, reason: "تسميع مقبول" },
  { label: "قبول بدون نقاط", value: 0, reason: "" },
];

function SubmissionCard({
  sub,
  highlighted,
  teacherName,
  halaqaId,
}: {
  sub: Submission;
  highlighted: boolean;
  teacherName: string;
  halaqaId: string;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(sub.note ?? "");
  const [rateOpen, setRateOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [rateNote, setRateNote] = useState("");
  const resolved = sub.state === "accepted" || sub.state === "rerecord";

  function confirmAccept() {
    if (rating === null) return;
    const chosen = RECITATION_RATINGS[rating];
    updateSubmission(sub.taskId, { state: "accepted" });
    if (chosen.value > 0 && sub.teacherId) {
      // de-duped by (recitation, child) so accepting twice never double-counts.
      recordSourcedPoints({
        childId: sub.childId,
        teacherId: sub.teacherId,
        teacherName,
        halaqaId,
        value: chosen.value,
        reason: chosen.reason,
        category: "recitation",
        note: rateNote.trim() || undefined,
        sourceType: "recitation",
        sourceId: sub.id,
        // Phase D: credit the linked material so its progress ring updates.
        // Falls back to category→material mapping when there is no materialId.
        materialId: sub.materialId,
      });
    }
    const earned = chosen.value > 0;
    pushNotification({
      userId: sub.childUserId,
      title: "تم قبول تسميعك",
      body: earned ? `أحسنت! وحصلت على ${chosen.value} نقاط.` : "أحسنت! تم قبول تسميعك.",
      type: "review_accepted",
      href: `/child/tasks?taskId=${sub.taskId}`,
    });
    if (sub.parentUserId) {
      pushNotification({
        userId: sub.parentUserId,
        title: "تم قبول تسميع طفلك",
        body: earned ? `${sub.childName}: وحصل على ${chosen.value} نقاط.` : `قَبِل المعلم تسميع ${sub.childName}.`,
        type: "review_accepted",
        href: `/parent/children/${sub.childId}`,
      });
    }
    setRateOpen(false);
  }

  function requestRerecord() {
    updateSubmission(sub.taskId, { state: "rerecord" });
    pushNotification({ userId: sub.childUserId, title: "المعلم طلب إعادة التسميع", body: "خلّينا نعيد التسميع بشكل أوضح.", type: "review_rerecord", href: `/child/tasks?taskId=${sub.taskId}` });
    if (sub.parentUserId) {
      pushNotification({ userId: sub.parentUserId, title: "المعلم طلب إعادة التسميع", body: `طلب المعلم إعادة تسميع ${sub.childName}.`, type: "review_rerecord", href: `/parent/children/${sub.childId}` });
    }
  }
  function saveNote() {
    const trimmed = note.trim();
    updateSubmission(sub.taskId, { note: trimmed || undefined });
    if (trimmed) {
      pushNotification({ userId: sub.childUserId, title: "لديك ملاحظة جديدة على التسميع", body: trimmed, type: "review_note", href: `/child/tasks?taskId=${sub.taskId}` });
    }
    setNoteOpen(false);
  }

  return (
    <Card variant="lavender" id={`submission-${sub.id}`} className={cn("flex flex-col gap-3", highlighted && "ring-2 ring-purple-soft")}>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-card-title font-bold break-words">{sub.title}</span>
        <span className="text-caption text-on-dark-muted">{sub.childName} · {sub.recordingType === "video" ? "فيديو" : "صوت"}</span>
      </div>
      {highlighted && (
        <span>
          <Badge tone="purple">وصلت من الإشعار</Badge>
        </span>
      )}
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
          <Button variant="primary" size="sm" onClick={() => { setRating(null); setRateNote(""); setRateOpen(true); }}>قبول التسميع</Button>
          <Button variant="danger" size="sm" onClick={requestRerecord}>طلب إعادة التسميع</Button>
          <Button variant="ghost" size="sm" onClick={() => setNoteOpen((v) => !v)}>إضافة ملاحظة</Button>
        </div>
      )}

      {rateOpen && (
        <Modal open onClose={() => setRateOpen(false)} title="تقييم التسميع">
          <div className="flex flex-col gap-4">
            <p className="text-caption text-on-dark-muted">اختر مستوى الأداء (يحدد النقاط):</p>
            <div className="flex flex-col gap-2">
              {RECITATION_RATINGS.map((r, i) => {
                const active = rating === i;
                return (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRating(i)}
                    className={cn(
                      "min-h-11 w-full rounded-md border px-4 text-start text-body font-bold transition",
                      active ? "border-purple-soft bg-purple/15 text-on-dark" : "border-purple/12 bg-surface-raised text-on-dark-muted hover:text-on-dark",
                    )}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-caption text-on-dark-muted">ملاحظة (اختياري)</span>
              <input
                value={rateNote}
                onChange={(e) => setRateNote(e.target.value)}
                placeholder="ملاحظة للطفل / ولي الأمر"
                className="min-h-11 rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={confirmAccept} disabled={rating === null}>تأكيد القبول</Button>
              <Button variant="ghost" onClick={() => setRateOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </Modal>
      )}
      {noteOpen && !resolved && (
        <div className="flex flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ملاحظة للطفل / ولي الأمر"
            className="min-h-11 rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
          />
          <Button variant="secondary" size="sm" onClick={saveNote}>حفظ الملاحظة</Button>
        </div>
      )}
    </Card>
  );
}

/** Recorded recitations approved by the parent and awaiting THIS teacher's review. */
export function TeacherSubmissions({
  teacherId,
  teacherName,
  halaqaId,
  highlightSubmissionId,
}: {
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  highlightSubmissionId?: string;
}) {
  const submissions = useSubmissions();
  // Parent-approved & awaiting THIS teacher's review (pending) vs already
  // processed (accepted / rerecord). Pending must always sort to the top so a
  // freshly parent-approved recitation never sits below older reviewed ones.
  const isPending = (s: Submission) => s.state === "pending_teacher";
  const isProcessed = (s: Submission) => s.state === "accepted" || s.state === "rerecord";
  const ts = (s: Submission) => Date.parse(s.createdAt) || 0;
  const items = Object.values(submissions)
    .filter((s) => s.teacherId === teacherId && (isPending(s) || isProcessed(s)))
    .sort((a, b) => (isPending(a) ? 0 : 1) - (isPending(b) ? 0 : 1) || ts(b) - ts(a));

  useEffect(() => {
    if (!highlightSubmissionId) return;
    const el = document.getElementById(`submission-${highlightSubmissionId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightSubmissionId, items.length]);

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="تسميعات مُسجّلة" subtitle="معتمدة من ولي الأمر" />
      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((s) => (
          <SubmissionCard
            key={s.taskId}
            sub={s}
            highlighted={s.id === highlightSubmissionId}
            teacherName={teacherName}
            halaqaId={halaqaId}
          />
        ))}
      </div>
    </section>
  );
}
