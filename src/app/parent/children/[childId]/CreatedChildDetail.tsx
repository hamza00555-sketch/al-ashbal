"use client";

import { Badge, Card, ChildDisplayAvatar, ChildDisplayName, PageHeader, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { getCreatedChildById, getDemoChildById } from "@/lib/demo/createdChildren";
import { ParentPoints } from "./ParentPoints";
import { ParentPrepInfo } from "./ParentPrepInfo";

/**
 * Detail view for a parent-CREATED child (resolved client-side from
 * localStorage, since created children are not in the seed roster). Shows the
 * identity + the live client stores (prep / points); seed-gated history is
 * simply empty for a new child.
 */
export function CreatedChildDetail({ childId }: { childId: string }) {
  const child = getDemoChildById(childId);
  const created = getCreatedChildById(childId);

  if (!child) {
    return (
      <>
        <PageHeader title="تفاصيل الطفل" />
        <Card>
          <p className="text-body text-on-dark-muted">لا يمكنك عرض بيانات هذا الطفل.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="تفاصيل الطفل"
        title={<ChildDisplayName childId={child.id} fallback={child.displayName} />}
        leading={<ChildDisplayAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} size="profile" />}
        actions={<Badge tone="success" onAccent>مرتبط بالحَلَقة</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <SectionTitle title="بيانات الطفل" />
          <div className="flex flex-wrap gap-2">
            {created?.age ? <Badge tone="purple">العمر: {created.age}</Badge> : null}
            {created?.level ? <Badge tone="neutral">المستوى: {created.level}</Badge> : null}
            {!created?.age && !created?.level && (
              <span className="text-caption text-on-dark-muted">لا بيانات إضافية بعد.</span>
            )}
          </div>
        </Card>

        <ParentPrepInfo halaqaId={child.halaqaId} />

        <Card className="flex flex-col gap-2">
          <SectionTitle title="التسميعات والمهام" />
          <p className="text-body text-on-dark-muted">لا تسميعات أو مهام بعد.</p>
        </Card>

        <ParentPoints childId={child.id} />
      </div>
    </>
  );
}
