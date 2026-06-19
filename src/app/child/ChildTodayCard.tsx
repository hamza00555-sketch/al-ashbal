"use client";

import Link from "next/link";
import { Badge, Card } from "@/components";
import { useAssignmentsForHalaqa } from "@/lib/demo/studentAssignments";

const ctaPrimary =
  "gradient-cta flex min-h-11 items-center justify-center rounded-md px-6 text-button font-bold text-cream shadow-glow transition hover:brightness-110";
const ctaGhost =
  "flex min-h-11 items-center justify-center rounded-md bg-surface-raised px-4 text-caption font-bold text-on-dark transition hover:bg-white/5";

/**
 * Live "today" card on /child. Shows the newest ACTIVE teacher assignment
 * (material · lesson) instead of a static demo lesson, with a "عرض المهام"
 * button. The attendance gate is a SEPARATE, clearly-labelled action — it is
 * not the way to view tasks and never blocks new assignments.
 */
export function ChildTodayCard({
  halaqaId,
  fallbackTitle,
  fallbackQuran,
}: {
  halaqaId: string;
  fallbackTitle?: string;
  fallbackQuran?: string;
}) {
  const active = useAssignmentsForHalaqa(halaqaId).filter((a) => a.status === "active");
  const latest = active[0]; // store is sorted active-first, newest-first

  const meta = latest
    ? [latest.materialName, latest.lessonTitle].filter(Boolean).join(" · ")
    : fallbackQuran;
  const title = latest?.title ?? fallbackTitle ?? "لا توجد مهمة جديدة الآن";
  const tasksHref = latest ? `/child/tasks?taskId=${latest.id}` : "/child/tasks";

  return (
    <Card variant="gradient" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-on-dark-muted">درس اليوم</span>
        <Badge tone={latest ? "purple" : "neutral"}>{latest ? "مهمة جديدة من المعلم" : "لا جديد"}</Badge>
      </div>
      <h2 className="text-h2 break-words">{title}</h2>
      {meta && <p className="text-body text-on-dark-muted break-words">{meta}</p>}

      <div className="flex flex-wrap gap-2">
        <Link href={tasksHref} className={ctaPrimary}>عرض المهام</Link>
        {/* Attendance gate is independent of tasks. */}
        <Link href="/child/lessons" className={ctaGhost}>حضور الحلقة</Link>
      </div>
    </Card>
  );
}
