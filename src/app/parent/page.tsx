/*
  Parent home (Phase 01 · Task 6) — /parent.
  Server component, mobile-first, calmer/quieter than the child page.
  Reads ONLY viewer-scoped accessors with getMockUser("parent"); never raw db,
  so a parent only ever sees their own linked children.
*/
import { AppShell, Avatar, Card, PageHeader, SectionTitle } from "@/components";
import {
  getMockUser,
  getNotificationsForViewer,
  getPendingParentApprovals,
  getVisibleChildren,
} from "@/lib/data";
import { ApprovalActions } from "./ApprovalActions";
import { ParentChildCard } from "./_ParentChildCard";
import { ParentMobileNav } from "./ParentMobileNav";
import { IconBell, IconVideo } from "./_icons";

export default function ParentHomePage() {
  const viewer = getMockUser("parent");
  const children = getVisibleChildren(viewer);
  const pending = getPendingParentApprovals(viewer);
  const notifications = getNotificationsForViewer(viewer);
  const unread = notifications.filter((n) => !n.readAt).length;
  const nameOf = (childId: string) =>
    children.find((c) => c.id === childId)?.displayName ?? "طفلك";

  return (
    <AppShell mobileNav={<ParentMobileNav />}>
      <div id="top" className="mx-auto flex w-full max-w-[430px] flex-col gap-6">
        <PageHeader
          eyebrow="أهلاً"
          title={viewer.displayName}
          subtitle="متابعة أبنائك باطمئنان"
          leading={<Avatar name={viewer.displayName} size="lg" />}
          actions={
            <span className="relative inline-flex size-9 items-center justify-center rounded-pill bg-surface-raised text-on-dark-muted">
              <span className="inline-flex size-5"><IconBell /></span>
              {unread > 0 && (
                <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-pill bg-coral" />
              )}
            </span>
          }
        />

        {/* Pending approval — the one action that needs the parent (limited light card) */}
        <section className="flex flex-col gap-3">
          <SectionTitle
            title="بانتظار موافقتك"
            subtitle="الفيديو لا يصل للمعلم إلا بعد موافقتك"
          />
          {pending.length > 0 ? (
            pending.map((r) => (
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
            ))
          ) : (
            <Card className="flex items-center gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
                <IconVideo />
              </span>
              <p className="text-body text-on-dark-muted">لا يوجد فيديو بانتظار موافقتك الآن.</p>
            </Card>
          )}
        </section>

        {/* Linked children */}
        <section id="children" className="flex flex-col gap-3">
          <SectionTitle title="أطفالك" subtitle={`${children.length} مرتبطون بك`} />
          {children.map((child) => (
            <ParentChildCard key={child.id} viewer={viewer} child={child} />
          ))}
        </section>

        {/* Brief notifications */}
        <section id="alerts" className="flex flex-col gap-3">
          <SectionTitle title="تنبيهات" />
          <Card className="flex flex-col gap-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <span className="mt-1.5 inline-flex size-2 shrink-0 rounded-pill bg-purple-soft" />
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-body font-bold break-words">{n.title}</span>
                    <span className="text-caption text-on-dark-muted break-words">{n.body}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body text-on-dark-muted">لا تنبيهات جديدة.</p>
            )}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
