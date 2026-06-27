"use client";

import Link from "next/link";
import { Badge, Card, CardOverlayMotif, ChildDisplayName, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { getDemoChildById } from "@/lib/demo/createdChildren";
import { useEnrolledChildIdsForParent } from "@/lib/demo/halaqaEnrollment";
import { LiveChildStatusAvatar } from "./LiveChildStatusAvatar";

/**
 * Parent home "أطفالي" — shows ONLY the children this parent has explicitly
 * enrolled into a halaqa (local demo). Empty-first: no children until enrolled,
 * and the empty state links to /parent/link-child (never to the child app).
 */
export function ParentLinkedChildren({ parentId }: { parentId: string }) {
  const ids = useEnrolledChildIdsForParent(parentId);
  const linked = ids
    .map((id) => getDemoChildById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle title="أطفالي" subtitle={`${linked.length} مرتبطون بك`} />
      {linked.length === 0 ? (
        <Card className="anim-rise flex flex-col items-start gap-3">
          <p className="text-body text-on-dark-muted">لم يتم ربط أي طفل بعد.</p>
          <p className="text-caption text-on-dark-muted">
            في النسخة الحقيقية سيتم الربط بدعوة أو كود موافقة. الآن يمكنك ربط طفل للتجربة.
          </p>
          <Link
            href="/parent/link-child"
            className="anim-cta-breathe inline-flex min-h-9 items-center rounded-pill bg-purple px-5 text-caption font-bold text-cream shadow-glow ring-1 ring-white/15 transition hover:brightness-110"
          >
            ربط أطفالك
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
