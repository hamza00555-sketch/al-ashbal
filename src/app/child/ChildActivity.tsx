"use client";

import { useState } from "react";
import { Badge, Button, Card, Modal } from "@/components";
import {
  ACTIVITY_TYPE_LABEL,
  useActiveActivityForHalaqa,
  useChildAnswer,
} from "@/lib/demo/activities";
import { useChildActiveHalaqaId } from "@/lib/demo/halaqaEnrollment";
import { ActivityRunner } from "./ActivityRunner";

/**
 * Temporary class activity on the child HOME (/child) — visible ONLY while the
 * teacher keeps an activity active for the child's halaqa. Opening it launches
 * a card-by-card runner (intro → questions → done). Mock (localStorage) only.
 */
export function ChildActivity({
  halaqaId,
  childId,
  childName,
  childUserId,
}: {
  halaqaId: string;
  childId: string;
  childName: string;
  childUserId: string;
}) {
  // The class activity follows the child's active (enrolled) halaqa; seed fallback only.
  const activeHalaqaId = useChildActiveHalaqaId(childId, halaqaId);
  const activity = useActiveActivityForHalaqa(activeHalaqaId);
  const myAnswer = useChildAnswer(activity?.activityId, childId);
  const [open, setOpen] = useState(false);

  if (!activity) return null;

  const sent = Boolean(myAnswer);

  return (
    <>
      <Card variant="gradient" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span><Badge tone="success" onAccent>نشاط مفتوح الآن</Badge></span>
          <Badge tone="purple" onAccent>{ACTIVITY_TYPE_LABEL[activity.type]}</Badge>
        </div>
        <h2 className="text-h2 break-words">{activity.title}</h2>
        {activity.description && (
          <p className="text-body text-cream/85 break-words">{activity.description}</p>
        )}
        <span className="text-caption text-cream/75">
          {activity.questions.length} {activity.questions.length === 1 ? "سؤال" : "أسئلة"}
        </span>
        {sent && <p className="text-caption text-cream">تم إرسال إجابتك</p>}
        <div className="lg:max-w-xs">
          <Button variant="primary" fullWidth onClick={() => setOpen(true)}>
            {sent ? "عرض النشاط" : "ابدأ النشاط"}
          </Button>
        </div>
      </Card>

      {open && (
        <Modal open onClose={() => setOpen(false)} title={activity.title} className="md:max-w-lg">
          <div className="max-h-[78vh] overflow-y-auto">
            <ActivityRunner
              activity={activity}
              childId={childId}
              childName={childName}
              childUserId={childUserId}
              halaqaId={activeHalaqaId}
              existing={myAnswer}
              onClose={() => setOpen(false)}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
