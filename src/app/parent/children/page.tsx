/* Parent · children (/parent/children) — compact list, link to each detail. */
import Link from "next/link";
import { Badge, Card, CardOverlayMotif, PageHeader } from "@/components";
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
          <Card key={child.id} variant="contrast" className="relative isolate flex items-center gap-3 overflow-hidden">
            <CardOverlayMotif motif="halo" className="-start-5 top-1/2 size-24 -translate-y-1/2 text-purple-soft opacity-[0.12]" />
            <span className="relative z-10">
              <ChildStatusAvatar name={child.displayName} level={summary.level} size="childCard" src={childAvatarSrc(child.gender)} />
            </span>
            <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-card-title font-bold break-words">{child.displayName}</span>
              <span className="text-caption text-pretty text-[#5F4B7A]">{summary.lastActivity}</span>
            </div>
            <div className="relative z-10 flex shrink-0 flex-col items-end gap-2">
              <Badge tone={CHILD_STATUS[summary.level].tone} onLight>{CHILD_STATUS[summary.level].label}</Badge>
              <Link
                href={`/parent/children/${child.id}`}
                className="text-caption font-bold text-purple transition hover:brightness-90"
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
