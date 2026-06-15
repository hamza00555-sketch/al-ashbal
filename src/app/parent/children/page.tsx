/* Parent children (/parent/children) — detailed per-child cards (linked only). */
import { NotificationBell, PageHeader } from "@/components";
import { getNotificationsForViewer } from "@/lib/data";
import { ParentChildCard } from "../_ParentChildCard";
import { getParentContext } from "../_shared";

export default function ParentChildrenPage() {
  const { viewer, children } = getParentContext();
  const notifications = getNotificationsForViewer(viewer);

  return (
    <>
      <PageHeader
        title="أطفالك"
        subtitle={`${children.length} مرتبطون بك`}
        actions={<NotificationBell notifications={notifications} />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {children.map((child) => (
          <ParentChildCard key={child.id} viewer={viewer} child={child} />
        ))}
      </div>
    </>
  );
}
