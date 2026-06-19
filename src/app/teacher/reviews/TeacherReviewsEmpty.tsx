"use client";

import { AppIllustration, Card } from "@/components";
import { useSubmissions } from "@/lib/demo/submissions";
import { IconVideo } from "../_icons";

/**
 * Empty-state for /teacher/reviews — shown only when there is nothing for THIS
 * teacher to review (no parent-approved or processed recordings). Driven by the
 * live submissions store, not a stale seed.
 */
export function TeacherReviewsEmpty({ teacherId }: { teacherId: string }) {
  const submissions = useSubmissions();
  const mine = Object.values(submissions).filter(
    (s) => s.teacherId === teacherId && (s.state === "pending_teacher" || s.state === "accepted" || s.state === "rerecord"),
  ).length;

  if (mine > 0) return null;

  return (
    <Card className="flex items-center gap-3">
      <AppIllustration
        name="illustration_waiting_review"
        className="size-16 shrink-0"
        fallback={
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
            <IconVideo />
          </span>
        }
      />
      <p className="text-body text-on-dark-muted">لا توجد تسميعات بانتظار المراجعة الآن.</p>
    </Card>
  );
}
