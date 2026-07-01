"use client";

import { Badge, Card, LinkButton } from "@/components";
import { useTodayLessonPlan } from "@/lib/demo/lessonPrep";

/**
 * Live "today lesson" summary on /child — sourced from the TEACHER'S prep
 * (lessonPrep, status "today"), NOT from the child's tasks. It shows a short
 * "المادة · الموضوع" list, a "تفاصيل درس اليوم" link and a separate
 * "حضور الحلقة" action. It never shows tasks or a "عرض المهام" button.
 */
export function ChildTodayCard({ halaqaId }: { halaqaId: string }) {
  // Single-class model: the passed halaqaId IS the child's class.
  const today = useTodayLessonPlan(halaqaId);
  const parts = today.slice(0, 4);

  return (
    <Card variant="gradient" className="anim-rise anim-breathe flex flex-col gap-3">
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
          <LinkButton href="/child/lessons" variant="secondary">تفاصيل درس اليوم</LinkButton>
        )}
        {/* Attendance gate — independent action, not task viewing. */}
        <LinkButton href="/child/lessons">حضور الحلقة</LinkButton>
      </div>
    </Card>
  );
}
