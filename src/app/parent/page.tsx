/*
  Parent overview (/parent) — starts with "أطفالي": the linked children as
  avatars with status rings, each linking to their detail page. Plus a pending
  approvals shortcut. Notifications stay in the top bell only.
*/
import Link from "next/link";
import { AppIcon, Avatar, Badge, Card, CardOverlayMotif, PageHeader, SectionTitle, SettingsLink } from "@/components";
import { getParentChildOverview, getPendingParentApprovals } from "@/lib/data";
import { childAvatarSrc } from "@/lib/avatars";
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
        leading={<Avatar name={viewer.displayName} size="hero" src="/assets/avatars/avatar_parent_father_01.png" />}
        actions={<SettingsLink />}
      />

      {pending.length > 0 && (
        <Link href="/parent/approvals" className="block rounded-lg transition hover:brightness-110">
          <Card className="flex items-center gap-3">
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
              className="card-contrast relative isolate flex flex-col items-center gap-2 overflow-hidden rounded-lg p-4 text-center shadow-soft ring-1 ring-black/5 transition hover:brightness-[1.03]"
            >
              <CardOverlayMotif motif="halo" className="-top-5 left-1/2 size-28 -translate-x-1/2 text-purple-soft opacity-[0.13]" />
              <span className="relative z-10">
                <ChildStatusAvatar name={child.displayName} level={summary.level} size="childCard" src={childAvatarSrc(child.gender)} />
              </span>
              <span className="relative z-10 text-card-title font-bold break-words">{child.displayName}</span>
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
