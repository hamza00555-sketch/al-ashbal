/*
  Parent overview (/parent) — starts with "أطفالي": the linked children as
  avatars with status rings, each linking to their detail page. Plus a pending
  approvals shortcut. Notifications stay in the top bell only.
*/
import Link from "next/link";
import { AppIcon, Avatar, Badge, Card, PageHeader, SectionTitle } from "@/components";
import { getParentChildOverview, getPendingParentApprovals } from "@/lib/data";
import { ChildStatusAvatar } from "./ChildStatusAvatar";
import { CHILD_STATUS, getParentContext } from "./_shared";
import { IconVideo } from "./_icons";

export default function ParentOverviewPage() {
  const { viewer } = getParentContext();
  const overview = getParentChildOverview(viewer);
  const pending = getPendingParentApprovals(viewer);

  return (
    <>
      <PageHeader
        eyebrow="أهلاً"
        title={viewer.displayName}
        subtitle="متابعة أبنائك باطمئنان"
        leading={<Avatar name={viewer.displayName} size="lg" src="/assets/avatars/avatar_parent_father_01.png" />}
      />

      {pending.length > 0 && (
        <Link href="/parent/approvals" className="block rounded-lg transition hover:brightness-110">
          <Card variant="contrast" className="flex items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple">
              <AppIcon name="icon_record_video" fallback={<IconVideo />} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-card-title font-bold break-words">
                لديك {pending.length} فيديو بانتظار موافقتك
              </span>
              <span className="text-caption opacity-70">اضغط لمراجعة الموافقات</span>
            </div>
          </Card>
        </Link>
      )}

      <section className="flex flex-col gap-3">
        <SectionTitle title="أطفالي" subtitle={`${overview.length} مرتبطون بك`} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {overview.map(({ child, summary }) => (
            <Link
              key={child.id}
              href={`/parent/children/${child.id}`}
              className="flex flex-col items-center gap-2 rounded-lg bg-surface p-4 text-center shadow-card transition hover:bg-surface-raised"
            >
              <ChildStatusAvatar name={child.displayName} level={summary.level} size="lg" />
              <span className="text-card-title font-bold break-words">{child.displayName}</span>
              <Badge tone={CHILD_STATUS[summary.level].tone}>{CHILD_STATUS[summary.level].label}</Badge>
              <span className="line-clamp-2 text-caption text-on-dark-muted break-words">
                {summary.lastActivity}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
