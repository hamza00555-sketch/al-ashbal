"use client";

import Link from "next/link";
import { Card, ChildDisplayAvatar, ChildDisplayName, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { childProfiles } from "@/lib/data/children";
import { useEnrolledChildIdsForHalaqa } from "@/lib/demo/halaqaEnrollment";

/**
 * Teacher's halaqa children — sourced from the local enrollment store (NOT the
 * seed roster). A child appears only after a parent enrolls them with the
 * halaqa code. Names/avatars use the per-childId display sync so teacher edits
 * elsewhere stay consistent.
 */
export function TeacherHalaqaChildren({
  halaqaId,
  withHeading = false,
}: {
  halaqaId: string;
  withHeading?: boolean;
}) {
  const ids = useEnrolledChildIdsForHalaqa(halaqaId);
  const children = ids
    .map((id) => childProfiles.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="flex flex-col gap-3">
      {withHeading && <SectionTitle title="أطفال الحلقة" subtitle={`${children.length} منضمّ — اضغط على الطفل لعرض تفاصيله`} />}
      {children.length > 0 ? (
        <Card variant="lavender" className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/teacher/children/${child.id}`}
              className="flex flex-col items-center gap-2 rounded-lg p-2 text-center transition hover:bg-[#6940A5]/10"
            >
              <span className="rounded-pill p-1 ring-2 ring-purple-soft/50">
                <ChildDisplayAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} size="childCard" />
              </span>
              <span className="w-full break-words text-caption font-bold">
                <ChildDisplayName childId={child.id} fallback={child.displayName} />
              </span>
            </Link>
          ))}
        </Card>
      ) : (
        <Card variant="lavender">
          <p className="text-body text-on-dark-muted">لا يوجد أطفال في حلقتك. شارك كود الحلقة مع أولياء الأمور للانضمام.</p>
        </Card>
      )}
    </section>
  );
}
