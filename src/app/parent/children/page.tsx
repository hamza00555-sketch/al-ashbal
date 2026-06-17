/* Parent · children (/parent/children) — compact list, link to each detail. */
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components";
import { getParentChildOverview } from "@/lib/data";
import { childAvatarSrc } from "@/lib/avatars";
import { ChildStatusAvatar } from "../ChildStatusAvatar";
import { CHILD_STATUS, getParentContext } from "../_shared";

export default function ParentChildrenPage() {
  const { viewer } = getParentContext();
  const overview = getParentChildOverview(viewer);

  return (
    <>
      <PageHeader title="أطفالي" subtitle={`${overview.length} مرتبطون بك`} />
      <div className="flex flex-col gap-3">
        {overview.map(({ child, summary }) => (
          <Card key={child.id} className="flex items-center gap-3">
            <ChildStatusAvatar name={child.displayName} level={summary.level} size="childCard" src={childAvatarSrc(child.gender)} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-card-title font-bold break-words">{child.displayName}</span>
              <span className="text-caption text-on-dark-muted break-words">{summary.lastActivity}</span>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Badge tone={CHILD_STATUS[summary.level].tone}>{CHILD_STATUS[summary.level].label}</Badge>
              <Link
                href={`/parent/children/${child.id}`}
                className="text-caption font-bold text-purple-soft transition hover:text-on-dark"
              >
                عرض التفاصيل
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
