"use client";

import { AppAssetIcon, AppIllustration, Avatar, Card, RecitationPreview } from "@/components";
import { childAvatarById } from "@/lib/avatars";
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

  // Pending reviews on top; accepted / re-record (processed) move to the bottom.
  const isProcessed = (it: ReviewItem) => {
    const s = reviews[it.recitationId]?.state;
    return s === "accepted" || s === "rerecord";
  };
  const pendingItems = items.filter((it) => !isProcessed(it));
  const processedItems = items.filter(isProcessed);

  const renderReviewCard = (item: ReviewItem) => (
    <Card key={item.recitationId} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={item.childName} size="lg" src={childAvatarById(item.childId)} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-card-title font-bold break-words">{item.title}</span>
          <span className="text-caption text-on-dark-muted">{item.childName} · تسميع جديد</span>
        </div>
        <AppAssetIcon src="/assets/icons/icon_record_video.png" size="sm" className="shrink-0 text-purple-soft" fallback={<IconVideo />} />
      </div>
      <RecitationPreview />
      <ReviewActions item={item} entry={reviews[item.recitationId]} />
    </Card>
  );

  if (items.length === 0) {
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

  return (
    <div className="flex flex-col gap-6">
      {pendingItems.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-body font-bold text-on-dark">بانتظار المراجعة</h2>
          <div className="grid gap-6 lg:grid-cols-2">{pendingItems.map(renderReviewCard)}</div>
        </section>
      ) : (
        <p className="text-body text-on-dark-muted">لا توجد تسميعات بانتظار المراجعة حاليًا.</p>
      )}

      {processedItems.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-body font-bold text-on-dark-muted">تمت مراجعتها</h2>
          <div className="grid gap-6 lg:grid-cols-2">{processedItems.map(renderReviewCard)}</div>
        </section>
      )}
    </div>
  );
}
