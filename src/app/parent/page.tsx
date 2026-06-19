/*
  Parent overview (/parent) — starts with "أطفالي": the linked children as
  avatars with status rings, each linking to their detail page. Plus a pending
  approvals shortcut. Notifications stay in the top bell only.
*/
import Link from "next/link";
import { Badge, CardOverlayMotif, ChildDisplayName, PageHeader, RoleAvatar, RoleName, SectionTitle, SettingsLink } from "@/components";
import { getParentChildOverview } from "@/lib/data";
import { childAvatarSrc } from "@/lib/avatars";
import { LiveChildStatusAvatar } from "./LiveChildStatusAvatar";
import { ParentPendingAlert } from "./ParentPendingAlert";
import { CHILD_STATUS, getParentContext } from "./_shared";

export default function ParentOverviewPage() {
  const { viewer } = getParentContext();
  const overview = getParentChildOverview(viewer);

  return (
    <>
      <PageHeader
        eyebrow="أهلاً"
        title={<RoleName role="parent" fallback={viewer.displayName} />}
        subtitle="متابعة أبنائك باطمئنان"
        leading={<RoleAvatar role="parent" fallbackName={viewer.displayName} fallbackSrc="/assets/avatars/avatar_parent_father_01.png" />}
        actions={<SettingsLink role="parent" />}
      />

      <ParentPendingAlert parentUserId={viewer.id} />

      <section className="flex flex-col gap-3">
        <SectionTitle title="أطفالي" subtitle={`${overview.length} مرتبطون بك`} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {overview.map(({ child, summary }) => (
            <Link
              key={child.id}
              href={`/parent/children/${child.id}`}
              className="card-contrast relative isolate flex flex-col items-center gap-2 overflow-hidden rounded-lg p-4 text-center shadow-soft ring-1 ring-black/5 transition hover:brightness-[1.03]"
            >
              <CardOverlayMotif motif="halo" className="-top-5 left-1/2 size-28 -translate-x-1/2 text-purple-soft opacity-[0.13]" />
              <span className="relative z-10">
                <LiveChildStatusAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} level={summary.level} size="childCard" />
              </span>
              <span className="relative z-10 text-card-title font-bold break-words">
                <ChildDisplayName childId={child.id} fallback={child.displayName} />
              </span>
              <Badge className="relative z-10" tone={CHILD_STATUS[summary.level].tone} onLight>{CHILD_STATUS[summary.level].label}</Badge>
              <span className="relative z-10 line-clamp-2 text-caption text-pretty text-[#5F4B7A]">
                {summary.lastActivity}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
