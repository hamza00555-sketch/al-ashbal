"use client";

import { useState } from "react";
import { Badge, Button } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import { upsertReview } from "@/lib/demo/workflow";

export interface ApprovalItem {
  recitationId: string;
  childId: string;
  childName: string;
  title: string;
  childUserId: string;
  parentUserId: string;
  teacherId?: string;
}

/**
 * Mock parent approval. On approve: queues the recitation for the teacher and
 * notifies the teacher + child. On re-record: notifies the child. localStorage
 * only — nothing persisted to a backend / the mock db.
 */
export function ApprovalActions({ item }: { item: ApprovalItem }) {
  const [decision, setDecision] = useState<"approved" | "rerecord" | null>(null);

  function approve() {
    upsertReview({
      recitationId: item.recitationId,
      childId: item.childId,
      childName: item.childName,
      title: item.title,
      childUserId: item.childUserId,
      parentUserId: item.parentUserId,
      teacherId: item.teacherId,
      state: "pending",
    });
    if (item.teacherId) {
      pushNotification({
        userId: item.teacherId,
        title: "تسميع جديد بانتظار المراجعة",
        body: `وصل تسميع معتمَد من ولي الأمر (${item.title}).`,
        type: "video_pending_teacher",
      });
    }
    pushNotification({
      userId: item.childUserId,
      title: "تم إرسال تسميعك للمعلم",
      body: "وافق ولي أمرك على التسميع وأرسله للمعلم.",
      type: "video_approved",
    });
    setDecision("approved");
  }

  function requestRerecord() {
    pushNotification({
      userId: item.childUserId,
      title: "ولي الأمر طلب إعادة تسجيل التسميع",
      body: "خلّينا نعيد التسجيل بشكل أوضح.",
      type: "rerecord",
    });
    setDecision("rerecord");
  }

  if (decision) {
    return (
      <span>
        <Badge tone={decision === "approved" ? "success" : "warning"}>
          {decision === "approved" ? "تمت الموافقة تجريبيًا" : "تم طلب إعادة التسجيل تجريبيًا"}
        </Badge>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" size="sm" onClick={approve}>موافقة</Button>
      <Button variant="danger" size="sm" onClick={requestRerecord}>إعادة التسجيل</Button>
    </div>
  );
}
