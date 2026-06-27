"use client";

import Link from "next/link";
import { Badge, Button, Card, CardOverlayMotif, ChildDisplayName } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { getDemoChildById } from "@/lib/demo/createdChildren";
import { removeParentChildLink, useLinkedChildIdsForParent } from "@/lib/demo/onboarding";
import { LiveChildStatusAvatar } from "../LiveChildStatusAvatar";

/** Parent's linked children with unlink. Empty-first: links to /parent/link-child. */
export function ParentChildrenManage({ parentId }: { parentId: string }) {
  const ids = useLinkedChildIdsForParent(parentId);
  const linked = ids
    .map((id) => getDemoChildById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (linked.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-2">
        <h2 className="text-card-title font-bold">لم يتم ربط أي طفل بعد</h2>
        <p className="text-body text-on-dark-muted">
          يمكنك إضافة طفلك الآن، أو ربط طفل سجّل بنفسه باستخدام كود ربط الطفل.
        </p>
        <Link
          href="/parent/link-child"
          className="mt-1 inline-flex min-h-11 items-center rounded-md bg-purple px-5 text-button font-bold text-cream shadow-card ring-1 ring-white/15 transition hover:brightness-110"
        >
          إضافة أو ربط طفل
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Link
          href="/parent/link-child"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-surface-raised px-3.5 text-caption font-bold text-on-dark ring-1 ring-purple/15 transition hover:bg-purple/8 hover:ring-purple/30"
        >
          إضافة أو ربط طفل
        </Link>
      </div>
      {linked.map((c, i) => (
        <Card key={c.id} variant="contrast" style={{ animationDelay: `${i * 0.06}s` }} className="anim-rise relative isolate flex items-center gap-3 overflow-hidden">
          <CardOverlayMotif motif="halo" className="-start-5 top-1/2 size-24 -translate-y-1/2 text-purple-soft opacity-[0.12]" />
          <span className="relative z-10">
            <LiveChildStatusAvatar childId={c.id} fallbackName={c.displayName} fallbackSrc={childAvatarSrc(c.gender)} level="excellent" size="childCard" />
          </span>
          <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-card-title font-bold">
              <ChildDisplayName childId={c.id} fallback={c.displayName} />
            </span>
            <span><Badge tone="purple" onLight>مرتبط بك</Badge></span>
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
