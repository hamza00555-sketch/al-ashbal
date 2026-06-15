/*
  Parent overview (Phase 01 · Task 6.3) — /parent.
  Calm at-a-glance entry. Notifications live ONLY in the top bell (no standalone
  section). Reads viewer-scoped accessors with getMockUser("parent").
*/
import Link from "next/link";
import { Avatar, Card, NotificationBell, PageHeader, StatCard } from "@/components";
import { getNotificationsForViewer, getPendingParentApprovals } from "@/lib/data";
import { IconUsers, IconVideo } from "./_icons";
import { getParentContext } from "./_shared";

export default function ParentOverviewPage() {
  const { viewer, children } = getParentContext();
  const pending = getPendingParentApprovals(viewer);
  const notifications = getNotificationsForViewer(viewer);

  return (
    <>
      <PageHeader
        eyebrow="أهلاً"
        title={viewer.displayName}
        subtitle="متابعة أبنائك باطمئنان"
        leading={<Avatar name={viewer.displayName} size="lg" />}
        actions={<NotificationBell notifications={notifications} />}
      />

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
