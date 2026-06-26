"use client";

import { AppIllustration, Card } from "@/components";
import { useSubmissions } from "@/lib/demo/submissions";
import { IconVideo } from "../_icons";

/**
 * Empty-state shown only when there is nothing awaiting THIS parent's approval
 * (no submission in state "pending_parent"). Driven by the live store, so it
 * appears correctly once everything is approved.
 */
export function ParentApprovalsEmpty({ parentUserId }: { parentUserId: string }) {
  const submissions = useSubmissions();
  const pending = Object.values(submissions).filter(
    (s) => s.parentUserId === parentUserId && s.state === "pending_parent",
  ).length;

  if (pending > 0) return null;

  return (
    <Card className="anim-rise flex items-center gap-3">
      <AppIllustration
        name="illustration_parent_approval"
        className="anim-float-b size-16 shrink-0"
        fallback={
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
            <IconVideo />
          </span>
        }
      />
      <p className="text-body text-on-dark-muted">لا يوجد فيديو بانتظار موافقتك الآن.</p>
    </Card>
  );
}
