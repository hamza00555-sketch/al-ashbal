/*
  Teacher · children (/teacher/children) — Phase 01 · Task A6.1.
  A simple VISUAL grid of the teacher's halaqa children (avatar + status ring +
  name). Tapping a child opens their detail page. No table, no inline points.
*/
import Link from "next/link";
import { Avatar, Card, PageHeader } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { cn } from "@/lib/cn";
import { getChildStatusSummary } from "@/lib/data";
import type { ChildStatusLevel } from "@/lib/data";
import { getTeacherContext } from "../_shared";

const RING: Record<ChildStatusLevel, string> = {
  excellent: "ring-mint",
  follow_up: "ring-gold",
  intervene: "ring-coral",
};

export default function TeacherChildrenPage() {
  const { viewer, children } = getTeacherContext();

  return (
    <>
      <PageHeader title="أطفال الحلقة" subtitle={`${children.length} طفلًا — اضغط على الطفل لعرض تفاصيله`} />

      {children.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {children.map((child) => {
            const level = getChildStatusSummary(viewer, child.id)?.level ?? "follow_up";
            return (
              <Link
                key={child.id}
                href={`/teacher/children/${child.id}`}
                className="flex flex-col items-center gap-2 rounded-lg p-2 text-center transition hover:bg-white/5"
              >
                <span className={cn("rounded-pill p-1 ring-2", RING[level])}>
                  <Avatar name={child.displayName} size="childCard" src={childAvatarSrc(child.gender)} />
                </span>
                <span className="w-full break-words text-caption font-bold">{child.displayName}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-body text-on-dark-muted">لا يوجد أطفال في حلقتك.</p>
        </Card>
      )}
    </>
  );
}
