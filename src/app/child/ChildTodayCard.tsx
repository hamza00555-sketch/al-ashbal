"use client";

import Link from "next/link";
import { Badge, Card } from "@/components";
import { useTodayLessonPlan } from "@/lib/demo/lessonPrep";
import { useChildActiveHalaqaId } from "@/lib/demo/halaqaEnrollment";

const ctaPrimary =
  "flex min-h-11 items-center justify-center rounded-md bg-surface-raised px-5 text-button font-bold text-on-dark ring-1 ring-purple-soft/40 transition hover:bg-purple/8";
const ctaGate =
  "gradient-cta flex min-h-11 items-center justify-center rounded-md px-6 text-button font-bold text-cream shadow-glow transition hover:brightness-110";

/**
 * Live "today lesson" summary on /child — sourced from the TEACHER'S prep
 * (lessonPrep, status "today"), NOT from the child's tasks. It shows a short
 * "المادة · الموضوع" list, a "تفاصيل درس اليوم" link and a separate
 * "حضور الحلقة" action. It never shows tasks or a "عرض المهام" button.
 */
export function ChildTodayCard({ halaqaId, childId }: { halaqaId: string; childId: string }) {
  // The child's today lesson comes from their ACTIVE (enrolled) halaqa; the seed
  // halaqaId is only a fallback so the demo page still opens when not enrolled.
  const activeHalaqaId = useChildActiveHalaqaId(childId, halaqaId);
  const today = useTodayLessonPlan(activeHalaqaId);
  const parts = today.slice(0, 4);

  return (
    <Card variant="gradient" className="anim-rise anim-breathe flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-cream/80">درس اليوم</span>
        <Badge tone={parts.length ? "purple" : "neutral"} onAccent>{parts.length ? "من تحضير المعلم" : "لا جديد"}</Badge>
      </div>

      {parts.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {parts.map((p) => (
            <li key={p.lessonId} className="text-h2 break-words">
              <span className="text-cream">{p.subject}</span>
              {(p.surahOrTopic || p.title) && (
                <span className="text-cream/75"> · {p.surahOrTopic || p.title}</span>
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
