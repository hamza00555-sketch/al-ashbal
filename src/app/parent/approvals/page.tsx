/* Parent approvals (/parent/approvals) — pending video approvals (mock actions). */
import { Card, PageHeader } from "@/components";
import { getPendingParentApprovals } from "@/lib/data";
import { ApprovalActions } from "../ApprovalActions";
import { IconVideo } from "../_icons";
import { getParentContext } from "../_shared";

export default function ParentApprovalsPage() {
  const { viewer, children } = getParentContext();
  const pending = getPendingParentApprovals(viewer);
  const nameOf = (childId: string) =>
    children.find((c) => c.id === childId)?.displayName ?? "طفلك";

  return (
    <>
      <PageHeader title="الموافقات" subtitle="الفيديو لا يصل للمعلم إلا بعد موافقتك" />

      {pending.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {pending.map((r) => (
            <Card key={r.id} variant="contrast" className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple">
                  <IconVideo />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{r.title}</span>
                  <span className="text-caption opacity-70">{nameOf(r.childId)} · تسميع جديد</span>
                </div>
              </div>
              <p className="text-caption opacity-70">
                راجع الفيديو قبل إرساله للمعلم. (الأزرار تجريبية)
              </p>
              <ApprovalActions />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
            <IconVideo />
          </span>
          <p className="text-body text-on-dark-muted">لا يوجد فيديو بانتظار موافقتك الآن.</p>
        </Card>
      )}
    </>
  );
}
