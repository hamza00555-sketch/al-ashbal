"use client";

import { Badge, Button, Card, ChildDisplayAvatar, ChildDisplayName } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { childProfiles } from "@/lib/data/children";
import { addParentChildLink, removeParentChildLink, useLinkedChildIds } from "@/lib/demo/parentChildLinks";

/**
 * Demo-only manual linking. Lists the available demo children for this parent;
 * linking writes to alashbal:demo-parent-child-links. No auto-linking.
 */
export function LinkChildPicker({ parentId }: { parentId: string }) {
  const linkedIds = useLinkedChildIds(parentId);
  // The parent's demo children pool (from the seed relationships) — explicit, not auto.
  const available = childProfiles.filter((c) => c.parentIds.includes(parentId));

  if (available.length === 0) {
    return (
      <Card><p className="text-body text-on-dark-muted">لا يوجد أطفال متاحون للربط في النسخة التجريبية.</p></Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {available.map((c) => {
        const isLinked = linkedIds.includes(c.id);
        return (
          <Card key={c.id} className="flex items-center gap-3">
            <ChildDisplayAvatar childId={c.id} fallbackName={c.displayName} fallbackSrc={childAvatarSrc(c.gender)} size="childCard" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-card-title font-bold">
                <ChildDisplayName childId={c.id} fallback={c.displayName} />
              </span>
              {isLinked && <Badge tone="success">مرتبط بحسابك</Badge>}
            </div>
            {isLinked ? (
              <Button variant="ghost" size="sm" onClick={() => removeParentChildLink(parentId, c.id)}>إلغاء الربط</Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => addParentChildLink(parentId, c.id)}>ربط هذا الطفل</Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
