"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import {
  activityResult,
  answerStats,
  QUESTION_TYPE_LABEL,
  useAnswersForActivity,
  type Activity,
  type ActivityAnswer,
  type ActivityQuestion,
  type QuestionAnswer,
} from "@/lib/demo/activities";
import { usePointsForChild } from "@/lib/demo/points";
import type { HalaqaChild } from "./ActivitiesManager";

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatValue(a: QuestionAnswer): string {
  switch (a.type) {
    case "true_false":
      return a.value === "true" ? "صح" : a.value === "false" ? "خطأ" : "—";
    case "ordering":
      return Array.isArray(a.value) ? (a.value as string[]).join(" ← ") : "—";
    case "task_acknowledgement": {
      const v = a.value as { acknowledged: boolean; note?: string };
      const base = v?.acknowledged ? "تم التنفيذ" : "لم يُنفّذ";
      return v?.note ? `${base} — ${v.note}` : base;
    }
    default:
      return typeof a.value === "string" && a.value.trim() ? a.value : "—";
  }
}

function AnswerDetail({ question, answer }: { question: ActivityQuestion; answer?: QuestionAnswer }) {
  return (
    <Card variant="raised" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-body font-bold break-words">{question.prompt}</span>
        <Badge tone="purple">{QUESTION_TYPE_LABEL[question.type]}</Badge>
      </div>
      {answer ? (
        <>
          <p className="text-body text-on-dark-muted break-words">{formatValue(answer)}</p>
          {answer.isCorrect === undefined ? (
            <span><Badge tone="warning">بحاجة مراجعة</Badge></span>
          ) : (
            <span><Badge tone={answer.isCorrect ? "success" : "danger"}>{answer.isCorrect ? "صحيح" : "خطأ"}</Badge></span>
          )}
        </>
      ) : (
        <span className="text-caption text-on-dark-muted">لم يُجب</span>
      )}
    </Card>
  );
}

function ChildAnswerCard({ activity, child, answer }: { activity: Activity; child: HalaqaChild; answer?: ActivityAnswer }) {
  const [open, setOpen] = useState(false);
  const stats = answer ? answerStats(activity, answer) : null;
  const byId = answer ? new Map(answer.answers.map((a) => [a.questionId, a])) : null;
  const result = answer ? activityResult(activity, answer) : null;
  const childPoints = usePointsForChild(child.id);
  const granted = childPoints.some(
    (p) => p.sourceType === "activity" && p.sourceId === activity.activityId && p.value > 0,
  );
  const hasMax = (activity.maxPoints ?? 0) > 0;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-card-title font-bold break-words">{child.name}</span>
        {answer ? <Badge tone="success">أجاب</Badge> : <Badge tone="neutral">لم يجب بعد</Badge>}
      </div>
      {answer && stats && (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">المجاب: {stats.answered}/{stats.total}</Badge>
            {stats.correctable > 0 && <Badge tone="purple">الصحيح: {stats.correct}/{stats.correctable}</Badge>}
            <Badge tone="neutral">{timeLabel(answer.submittedAt)}</Badge>
          </div>
          {hasMax && result && (
            <div className="flex flex-wrap gap-2">
              {result.autoGradable ? (
                <>
                  <Badge tone="gold">النقاط المحتسبة: {result.points} من {activity.maxPoints}</Badge>
                  <Badge tone={granted ? "success" : "neutral"}>{granted ? "تم منح النقاط" : "بدون نقاط"}</Badge>
                </>
              ) : (
                <Badge tone="warning">يحتاج مراجعة يدوية</Badge>
              )}
            </div>
          )}
          <div className="sm:max-w-xs">
            <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? "إخفاء الإجابات" : "عرض الإجابات"}
            </Button>
          </div>
          {open && (
            <div className="flex flex-col gap-2">
              {activity.questions.map((q) => (
                <AnswerDetail key={q.questionId} question={q} answer={byId?.get(q.questionId)} />
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/** Teacher view of children's answers — scoped to the teacher's halaqa children. */
export function StudentAnswers({
  activity,
  halaqaChildren,
}: {
  activity: Activity;
  halaqaChildren: HalaqaChild[];
}) {
  const answers = useAnswersForActivity(activity.activityId);
  const byChild = new Map(answers.map((a) => [a.childId, a]));

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle
        title="إجابات الطلاب"
        subtitle={activity.status === "active" ? "النشاط مفعّل الآن" : "نشاط منتهٍ"}
      />
      {halaqaChildren.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {halaqaChildren.map((child) => (
            <ChildAnswerCard key={child.id} activity={activity} child={child} answer={byChild.get(child.id)} />
          ))}
        </div>
      ) : (
        <Card><p className="text-body text-on-dark-muted">لا يوجد أطفال في الحلقة.</p></Card>
      )}
    </section>
  );
}
