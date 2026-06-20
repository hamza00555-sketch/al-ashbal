"use client";

import Link from "next/link";
import { Badge, Button, Card, CardOverlayMotif, ChildDisplayName } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { childProfiles } from "@/lib/data/children";
import { removeParentChildLink, useLinkedChildIds } from "@/lib/demo/parentChildLinks";
import { LiveChildStatusAvatar } from "../LiveChildStatusAvatar";

/** Linked children list with unlink. Empty-first: links to /parent/link-child. */
export function ParentChildrenManage({ parentId }: { parentId: string }) {
  const ids = useLinkedChildIds(parentId);
  const linked = ids
    .map((id) => childProfiles.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (linked.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <p className="text-body text-on-dark-muted">لم يتم ربط أي طفل بعد.</p>
        <Link
          href="/parent/link-child"
          className="inline-flex min-h-9 items-center rounded-pill bg-purple/15 px-4 text-caption font-bold text-purple-soft ring-1 ring-purple-soft/40 transition hover:bg-purple/25"
        >
          ربط أطفالك
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {linked.map((c) => (
        <Card key={c.id} variant="contrast" className="relative isolate flex items-center gap-3 overflow-hidden">
          <CardOverlayMotif motif="halo" className="-start-5 top-1/2 size-24 -translate-y-1/2 text-purple-soft opacity-[0.12]" />
          <span className="relative z-10">
            <LiveChildStatusAvatar childId={c.id} fallbackName={c.displayName} fallbackSrc={childAvatarSrc(c.gender)} level="excellent" size="childCard" />
          </span>
          <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-card-title font-bold">
              <ChildDisplayName childId={c.id} fallback={c.displayName} />
            </span>
            <Badge tone="purple" onLight>مرتبط</Badge>
          </div>
          <div className="relative z-10 flex shrink-0 flex-col items-end gap-2">
            <Link href={`/parent/children/${c.id}`} className="text-caption font-bold text-purple transition hover:brightness-90">
              عرض التفاصيل
            </Link>
            <Button variant="ghost" size="sm" onClick={() => removeParentChildLink(parentId, c.id)}>إلغاء الربط</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
