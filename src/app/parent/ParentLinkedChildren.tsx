"use client";

import Link from "next/link";
import { Badge, Card, CardOverlayMotif, ChildDisplayName, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { getDemoChildById } from "@/lib/demo/createdChildren";
import { useLinkedChildIdsForParent } from "@/lib/demo/onboarding";
import { LiveChildStatusAvatar } from "./LiveChildStatusAvatar";

/**
 * Parent home "أطفالي" — shows ONLY the children linked to this parent
 * (parent↔child links, local demo). Empty-first; the empty state links to
 * /parent/link-child to add or link a child (never to the child app).
 */
export function ParentLinkedChildren({ parentId }: { parentId: string }) {
  const ids = useLinkedChildIdsForParent(parentId);
  const linked = ids
    .map((id) => getDemoChildById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="أطفالي" subtitle={`${linked.length} مرتبطون بك`} />
      {linked.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {linked.map((c, i) => (
            <Link
              key={c.id}
              href={`/parent/children/${c.id}`}
              style={{ animationDelay: `${i * 0.06}s` }}
              className="card-contrast anim-rise relative isolate flex flex-col items-center gap-2 overflow-hidden rounded-lg p-4 text-center shadow-soft ring-1 ring-purple/10 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <CardOverlayMotif motif="halo" className="-top-5 left-1/2 size-28 -translate-x-1/2 text-purple-soft opacity-[0.13]" />
              <span className="relative z-10">
                <LiveChildStatusAvatar childId={c.id} fallbackName={c.displayName} fallbackSrc={childAvatarSrc(c.gender)} level="excellent" size="childCard" />
              </span>
              <span className="relative z-10 w-full text-card-title font-bold">
                <ChildDisplayName childId={c.id} fallback={c.displayName} />
              </span>
              <Badge className="relative z-10" tone="purple" onLight>مرتبط</Badge>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
