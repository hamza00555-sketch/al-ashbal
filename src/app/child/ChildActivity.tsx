"use client";

import { useState } from "react";
import { Badge, Button, Card, Modal } from "@/components";
import { cn } from "@/lib/cn";
import {
  ACTIVITY_TYPE_LABEL,
  submitAnswer,
  useActiveActivityForHalaqa,
  useChildAnswer,
} from "@/lib/demo/activities";

/**
 * Temporary class activity on the child HOME (/child) — visible ONLY while the
 * teacher keeps an activity active for the child's halaqa. Submitting an answer
 * is mock (localStorage); the child only sees a short confirmation afterwards.
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
  const activity = useActiveActivityForHalaqa(halaqaId);
  const myAnswer = useChildAnswer(activity?.activityId, childId);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string>("");
  const [text, setText] = useState("");

  if (!activity) return null;

  const hasOptions = activity.options.length > 0;
  const sent = Boolean(myAnswer);

  function send(answer: string) {
    if (!activity || !answer.trim()) return;
    submitAnswer({
      activityId: activity.activityId,
      childId,
      childName,
      childUserId,
      halaqaId,
      answer: answer.trim(),
    });
  }

  return (
    <>
      <Card variant="gradient" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span><Badge tone="success">نشاط مفتوح الآن</Badge></span>
          <Badge tone="purple">{ACTIVITY_TYPE_LABEL[activity.type]}</Badge>
        </div>
        <h2 className="text-h2 break-words">{activity.title}</h2>
        {activity.description && (
          <p className="text-body text-on-dark-muted break-words">{activity.description}</p>
        )}
        {sent && (
          <p className="text-caption text-mint">تم إرسال إجابتك</p>
        )}
        <div className="lg:max-w-xs">
          <Button variant="primary" fullWidth onClick={() => setOpen(true)}>
            {sent ? "عرض النشاط" : "ابدأ النشاط"}
          </Button>
        </div>
      </Card>

      {open && (
        <Modal open onClose={() => setOpen(false)} title={activity.title}>
          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
            <p className="text-body break-words">{activity.prompt}</p>

            {sent ? (
              <div className="flex flex-col gap-2">
                <Badge tone="success">تم إرسال إجابتك تجريبيًا</Badge>
                {myAnswer && (
                  <p className="text-caption text-on-dark-muted break-words">إجابتك: {myAnswer.answer}</p>
                )}
              </div>
            ) : hasOptions ? (
              <div className="flex flex-col gap-2">
                {activity.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setChoice(opt);
                      send(opt);
                    }}
                    className={cn(
                      "min-h-11 w-full rounded-md border px-4 text-start text-body transition",
                      choice === opt
                        ? "border-purple-soft bg-purple/15 text-on-dark"
                        : "border-white/10 bg-surface-raised text-on-dark-muted hover:text-on-dark",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="اكتب إجابتك هنا"
                  rows={3}
                  className="min-h-20 w-full rounded-md border border-white/10 bg-surface-raised px-4 py-2 text-body text-on-dark outline-none transition focus:border-purple-soft"
                />
                <div className="sm:max-w-xs">
                  <Button variant="primary" fullWidth disabled={!text.trim()} onClick={() => send(text)}>
                    إرسال
                  </Button>
                </div>
              </div>
            )}

            <p className="text-caption text-on-dark-muted">
              النشاط تجريبي — تُحفظ إجابتك على هذا الجهاز فقط.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
