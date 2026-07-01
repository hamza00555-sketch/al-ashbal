/*
  Shared empty-state card — unifies the two competing patterns (illustrated vs
  bare lavender sentence) into one component. Illustration is optional so dense
  teacher management pages can stay compact.
*/
import type { ReactNode } from "react";
import { Card } from "./Card";
import { AppIllustration } from "./AppIllustration";

export function EmptyState({
  title,
  hint,
  illustration,
  action,
}: {
  title: string;
  hint?: string;
  /** Optional /assets/illustrations/<name>.png key (e.g. "illustration_no_tasks"). */
  illustration?: string;
  action?: ReactNode;
}) {
  return (
    <Card variant="lavender" className="flex flex-col items-center gap-3 text-center">
      {illustration && <AppIllustration name={illustration} className="size-24" />}
      <div className="flex flex-col gap-1">
        <span className="text-body font-bold">{title}</span>
        {hint && <span className="text-caption text-on-dark-muted">{hint}</span>}
      </div>
      {action}
    </Card>
  );
}
