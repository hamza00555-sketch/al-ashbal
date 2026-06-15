/*
  Parent overview (Phase 01 · Task 6.3/6.4) — /parent.
  Calm at-a-glance entry with a clear path to approvals. Notifications live ONLY
  in the top bell (no standalone section). Viewer-scoped accessors only.
*/
import Link from "next/link";
import { Avatar, Card, PageHeader, StatCard } from "@/components";
import { getPendingParentApprovals } from "@/lib/data";
import { IconUsers, IconVideo } from "./_icons";
import { getParentContext } from "./_shared";

export default function ParentOverviewPage() {
  const { viewer, children } = getParentContext();
  const pending = getPendingParentApprovals(viewer);

  return (
    <>
      <PageHeader
        eyebrow="أهلاً"
        title={viewer.displayName}
        subtitle="متابعة أبنائك باطمئنان"
        leading={<Avatar name={viewer.displayName} size="lg" />}
      />

      {/* Clear path to approvals when something is pending */}
      {pending.length > 0 && (
        <Link
          href="/parent/approvals"
          className="block rounded-lg transition hover:brightness-110"
        >
          <Card variant="contrast" className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple">
                <IconVideo />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-card-title font-bold break-words">
                  لديك {pending.length} فيديو بانتظار موافقتك
                </span>
                <span className="text-caption opacity-70">اضغط لمراجعة الموافقات</span>
              </div>
            </div>
          </Card>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Link href="/parent/children" className="block rounded-lg transition hover:brightness-110">
          <StatCard
            label="أطفالك"
            value={children.length}
            tone="purple"
            icon={<span className="inline-flex size-6"><IconUsers /></span>}
            hint="عرض التفاصيل"
          />
        </Link>
        <Link href="/parent/approvals" className="block rounded-lg transition hover:brightness-110">
          <StatCard
            label="بانتظار موافقتك"
            value={pending.length}
            tone={pending.length > 0 ? "gold" : "success"}
            icon={<span className="inline-flex size-6"><IconVideo /></span>}
            hint="مراجعة الفيديوهات"
          />
        </Link>
      </div>

      <Card>
        <p className="text-body text-on-dark-muted">
          الفيديو لا يصل للمعلم إلا بعد موافقتك. تابع تقدّم أبنائك من قسم «أطفالي»،
          وراجع التسميعات الجديدة من «الموافقات».
        </p>
      </Card>
    </>
  );
}
