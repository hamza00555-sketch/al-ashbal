"use client";

import { Badge, Button, Card } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import {
  ACTIVITY_TYPE_LABEL,
  closeActivity,
  QUESTION_TYPE_LABEL,
  resetActivitiesData,
  useActiveActivityForHalaqa,
  useTeacherActivities,
  type Activity,
} from "@/lib/demo/activities";
import { ActivityForm } from "./ActivityForm";
import { StudentAnswers } from "./StudentAnswers";

export interface HalaqaChild {
  id: string;
  name: string;
  userId: string;
}

export function ActivitiesManager({
  teacherId,
  teacherName,
  halaqaId,
  halaqaName,
  halaqaChildren,
}: {
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  halaqaName: string;
  halaqaChildren: HalaqaChild[];
}) {
  const active = useActiveActivityForHalaqa(halaqaId);
  const teacherActivities = useTeacherActivities(teacherId);
  // Whose answers to show: the active activity, else the most recent one here.
  const current = active ?? teacherActivities.find((a) => a.halaqaId === halaqaId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {active && <ActiveActivityCard activity={active} halaqaChildren={halaqaChildren} />}
      <ActivityForm
        teacherId={teacherId}
        teacherName={teacherName}
        halaqaId={halaqaId}
        halaqaName={halaqaName}
        halaqaChildren={halaqaChildren}
        hasActive={Boolean(active)}
      />
      {current && <StudentAnswers activity={current} halaqaChildren={halaqaChildren} />}

      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">بيانات تجريبية</span>
        <p className="text-caption text-on-dark-muted">
          يمسح أنشطة الحلقات وإجاباتها فقط على هذا الجهاز. لا يؤثر على التسجيلات أو الإشعارات أو التحضير أو الحضور أو الموافقات.
        </p>
        <div className="sm:max-w-xs">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => {
              if (window.confirm("هل تريد مسح بيانات الأنشطة وإجاباتها التجريبية؟")) {
                resetActivitiesData();
              }
            }}
          >
            إعادة ضبط بيانات الأنشطة التجريبية
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ActiveActivityCard({ activity, halaqaChildren }: { activity: Activity; halaqaChildren: HalaqaChild[] }) {
  function close() {
    closeActivity(activity.activityId);
    for (const child of halaqaChildren) {
      if (!child.userId) continue;
      pushNotification({
        userId: child.userId,
        title: "انتهى النشاط",
        body: `انتهى نشاط: ${activity.title}`,
        type: "activity_closed",
        href: "/child",
      });
    }
  }

  return (
    <Card variant="gradient" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span><Badge tone="success" onAccent>مفعّل الآن</Badge></span>
        <Badge tone="purple" onAccent>{ACTIVITY_TYPE_LABEL[activity.type]}</Badge>
      </div>
      <h2 className="text-h2 break-words">{activity.title}</h2>
      {activity.description && (
        <p className="text-body text-cream/85 break-words">{activity.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge tone="neutral" onAccent>
          {activity.questions.length} {activity.questions.length === 1 ? "سؤال" : "أسئلة"}
        </Badge>
        {activity.durationMinutes ? <Badge tone="neutral" onAccent>{activity.durationMinutes} دقيقة</Badge> : null}
      </div>
      <ul className="flex flex-col gap-1">
        {activity.questions.map((q, i) => (
          <li key={q.questionId} className="flex items-center gap-2 text-caption text-cream/80 break-words">
            <span className="text-cream">{i + 1}.</span>
            <span className="min-w-0 flex-1 break-words">{q.prompt}</span>
            <Badge tone="neutral" onAccent>{QUESTION_TYPE_LABEL[q.type]}</Badge>
          </li>
        ))}
      </ul>
      <div className="sm:max-w-xs">
        <Button variant="danger" fullWidth onClick={close}>إغلاق النشاط</Button>
      </div>
    </Card>
  );
}
