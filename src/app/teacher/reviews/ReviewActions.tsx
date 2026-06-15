"use client";

import { useState } from "react";
import { Badge, Button } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import { upsertReview, type ReviewEntry } from "@/lib/demo/workflow";

export interface ReviewItem {
  recitationId: string;
  childId: string;
  childName: string;
  title: string;
  childUserId: string;
  parentUserId: string;
}

/**
 * Mock teacher review controls — accept / request re-record / add note. Result
 * is stored in the demo review queue and notifications are pushed to the child
 * (and parent where relevant). localStorage only, no backend.
 */
export function ReviewActions({ item, entry }: { item: ReviewItem; entry?: ReviewEntry }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(entry?.note ?? "");

  const state = entry?.state;
  const note = entry?.note;

  function withState(extra: Partial<ReviewEntry>): ReviewEntry {
    return {
      recitationId: item.recitationId,
      childId: item.childId,
      childName: item.childName,
      title: item.title,
      childUserId: item.childUserId,
      parentUserId: item.parentUserId,
      state: entry?.state ?? "pending",
      note: entry?.note,
      ...extra,
    };
  }

  function accept() {
    upsertReview(withState({ state: "accepted" }));
    pushNotification({ userId: item.childUserId, title: "تم قبول تسميعك", body: "أحسنت! تم قبول تسميعك.", type: "review_accepted" });
    if (item.parentUserId) {
      pushNotification({ userId: item.parentUserId, title: "تم قبول تسميع الطفل", body: `قَبِل المعلم تسميع ${item.childName}.`, type: "review_accepted" });
    }
  }

  function rerecord() {
    upsertReview(withState({ state: "rerecord" }));
    pushNotification({ userId: item.childUserId, title: "المعلم طلب إعادة التسميع", body: "خلّينا نعيد التسميع بشكل أوضح.", type: "review_rerecord" });
    if (item.parentUserId) {
      pushNotification({ userId: item.parentUserId, title: "المعلم طلب إعادة التسميع", body: `طلب المعلم إعادة تسميع ${item.childName}.`, type: "review_rerecord" });
    }
  }

  function saveNote() {
    const trimmed = noteDraft.trim();
    upsertReview(withState({ note: trimmed || undefined }));
    if (trimmed) {
      pushNotification({ userId: item.childUserId, title: "لديك ملاحظة جديدة على التسميع", body: trimmed, type: "review_note" });
    }
    setNoteOpen(false);
  }

  const resolved = state === "accepted" || state === "rerecord";

  return (
    <div className="flex flex-col gap-2">
      {note && <p className="text-caption text-on-dark-muted">ملاحظة: {note}</p>}

      {resolved ? (
        <span>
          <Badge tone={state === "accepted" ? "success" : "warning"}>
            {state === "accepted" ? "تم قبول التسميع تجريبيًا" : "طلب المعلم إعادة التسميع تجريبيًا"}
          </Badge>
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={accept}>قبول التسميع</Button>
          <Button variant="danger" size="sm" onClick={rerecord}>طلب إعادة التسميع</Button>
          <Button variant="ghost" size="sm" onClick={() => setNoteOpen((v) => !v)}>إضافة ملاحظة</Button>
        </div>
      )}

      {noteOpen && !resolved && (
        <div className="flex flex-col gap-2">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="ملاحظة للطفل / ولي الأمر"
            className="min-h-11 rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
          />
          <Button variant="secondary" size="sm" onClick={saveNote}>حفظ الملاحظة</Button>
        </div>
      )}

      <p className="text-caption text-on-dark-muted">التفاعل تجريبي — لا يُحفظ في قاعدة بيانات.</p>
    </div>
  );
}
