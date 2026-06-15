"use client";

import { Card, RecitationPreview } from "@/components";
import { useReviews } from "@/lib/demo/workflow";
import { IconVideo } from "../_icons";
import { ReviewActions, type ReviewItem } from "./ReviewActions";

/**
 * Teacher reviews list. Merges the db pending items (server) with the
 * parent-approved items queued in the demo review store, so approvals made in
 * /parent/approvals show up here in the same browser.
 */
export function TeacherReviewsList({ dbItems }: { dbItems: ReviewItem[] }) {
  const reviews = useReviews();

  const byId = new Map<string, ReviewItem>();
  for (const item of dbItems) byId.set(item.recitationId, item);
  for (const entry of Object.values(reviews)) {
    if (!byId.has(entry.recitationId)) {
      byId.set(entry.recitationId, {
        recitationId: entry.recitationId,
        childId: entry.childId,
        childName: entry.childName,
        title: entry.title,
        childUserId: entry.childUserId,
        parentUserId: entry.parentUserId ?? "",
      });
    }
  }
  const items = [...byId.values()];

  if (items.length === 0) {
    return (
      <Card className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
          <IconVideo />
        </span>
        <p className="text-body text-on-dark-muted">لا توجد تسميعات بانتظار المراجعة الآن.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {items.map((item) => (
        <Card key={item.recitationId} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple-soft">
              <IconVideo />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-card-title font-bold break-words">{item.title}</span>
              <span className="text-caption text-on-dark-muted">{item.childName} · تسميع جديد</span>
            </div>
          </div>
          <RecitationPreview />
          <ReviewActions item={item} entry={reviews[item.recitationId]} />
        </Card>
      ))}
    </div>
  );
}
