"use client";

import Link from "next/link";
import { Badge, Card } from "@/components";
import { useTodayLessonPlan } from "@/lib/demo/lessonPrep";

const ctaPrimary =
  "flex min-h-11 items-center justify-center rounded-md bg-surface-raised px-5 text-button font-bold text-on-dark ring-1 ring-purple-soft/40 transition hover:bg-white/5";
const ctaGate =
  "gradient-cta flex min-h-11 items-center justify-center rounded-md px-6 text-button font-bold text-cream shadow-glow transition hover:brightness-110";

/**
 * Live "today lesson" summary on /child — sourced from the TEACHER'S prep
 * (lessonPrep, status "today"), NOT from the child's tasks. It shows a short
 * "المادة · الموضوع" list, a "تفاصيل درس اليوم" link and a separate
 * "حضور الحلقة" action. It never shows tasks or a "عرض المهام" button.
 */
export function ChildTodayCard({ halaqaId }: { halaqaId: string }) {
  const today = useTodayLessonPlan(halaqaId);
  const parts = today.slice(0, 4);

  return (
    <Card variant="gradient" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-on-dark-muted">درس اليوم</span>
        <Badge tone={parts.length ? "purple" : "neutral"}>{parts.length ? "من تحضير المعلم" : "لا جديد"}</Badge>
      </div>

      {parts.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {parts.map((p) => (
            <li key={p.lessonId} className="text-h2 break-words">
              <span className="text-on-dark">{p.subject}</span>
              {(p.surahOrTopic || p.title) && (
                <span className="text-on-dark-muted"> · {p.surahOrTopic || p.title}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <h2 className="text-h2 break-words">لا يوجد درس محدد اليوم</h2>
      )}

      <div className="flex flex-wrap gap-2">
        {parts.length > 0 && (
          <Link href="/child/lessons" className={ctaPrimary}>تفاصيل درس اليوم</Link>
        )}
        {/* Attendance gate — independent action, not task viewing. */}
        <Link href="/child/lessons" className={ctaGate}>حضور الحلقة</Link>
      </div>
    </Card>
  );
}
