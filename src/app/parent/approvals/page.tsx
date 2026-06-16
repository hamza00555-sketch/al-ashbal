/* Parent approvals (/parent/approvals) — pending video approvals (mock actions). */
import { AppIcon, AppIllustration, Card, PageHeader, RecitationPreview } from "@/components";
import { getPendingParentApprovals, getTeacherIdsForChild } from "@/lib/data";
import { ApprovalActions, type ApprovalItem } from "../ApprovalActions";
import { IconVideo } from "../_icons";
import { getParentContext } from "../_shared";
import { ParentSubmissions } from "./ParentSubmissions";

export default async function ParentApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const { viewer, children } = getParentContext();
  const pending = getPendingParentApprovals(viewer);

  const items: ApprovalItem[] = pending.map((r) => {
    const child = children.find((c) => c.id === r.childId);
    return {
      recitationId: r.id,
      childId: r.childId,
      childName: child?.displayName ?? "طفلك",
      title: r.title,
      childUserId: child?.userId ?? "",
      parentUserId: viewer.id,
      teacherId: getTeacherIdsForChild(viewer, r.childId)[0],
    };
  });

  return (
    <>
      <PageHeader title="الموافقات" subtitle="الفيديو لا يصل للمعلم إلا بعد موافقتك" />

      <ParentSubmissions parentUserId={viewer.id} highlightSubmissionId={submissionId} />

      {items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <Card key={item.recitationId} variant="contrast" className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple">
                  <AppIcon name="icon_record_video" fallback={<IconVideo />} />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{item.title}</span>
                  <span className="text-caption opacity-70">{item.childName} · تسميع جديد</span>
                </div>
              </div>
              <RecitationPreview />
              <p className="text-caption opacity-70">
                راجع الفيديو قبل إرساله للمعلم. (الأزرار تجريبية)
              </p>
              <ApprovalActions item={item} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex items-center gap-3">
          <AppIllustration
            name="illustration_parent_approval"
            className="size-16 shrink-0"
            fallback={
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
                <IconVideo />
              </span>
            }
          />
          <p className="text-body text-on-dark-muted">لا يوجد فيديو بانتظار موافقتك الآن.</p>
        </Card>
      )}
    </>
  );
}
