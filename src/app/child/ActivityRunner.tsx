"use client";

import { useMemo, useState } from "react";
import { Badge, Button } from "@/components";
import { cn } from "@/lib/cn";
import {
  defaultValue,
  gradeQuestion,
  isQuestionAnswered,
  QUESTION_TYPE_LABEL,
  submitAnswer,
  type Activity,
  type ActivityAnswer,
  type ActivityQuestion,
  type MatchPair,
  type QuestionValue,
} from "@/lib/demo/activities";
import { MatchingInput } from "./MatchingInput";
import { OrderingInput } from "./OrderingInput";

type Phase = "intro" | "run" | "done";

export function ActivityRunner({
  activity,
  childId,
  childName,
  childUserId,
  halaqaId,
  existing,
  onClose,
}: {
  activity: Activity;
  childId: string;
  childName: string;
  childUserId: string;
  halaqaId: string;
  existing: ActivityAnswer | null;
  onClose: () => void;
}) {
  const questions = activity.questions;

  const initial = useMemo(() => {
    const map: Record<string, QuestionValue> = {};
    for (const q of questions) {
      const prev = existing?.answers.find((a) => a.questionId === q.questionId);
      map[q.questionId] = prev ? prev.value : defaultValue(q);
    }
    return map;
  }, [questions, existing]);

  const [values, setValues] = useState<Record<string, QuestionValue>>(initial);
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function setValue(questionId: string, value: QuestionValue) {
    setValues((prev) => ({ ...prev, [questionId]: value }));
  }

  function submit() {
    const firstMissing = questions.findIndex(
      (q) => q.required && !isQuestionAnswered(q, values[q.questionId]),
    );
    if (firstMissing !== -1) {
      setStep(firstMissing);
      setError("أكمل الأسئلة المطلوبة أولًا.");
      return;
    }
    submitAnswer({
      activityId: activity.activityId,
      childId,
      childName,
      childUserId,
      halaqaId,
      answers: questions.map((q) => {
        const value = values[q.questionId];
        return { questionId: q.questionId, type: q.type, value, isCorrect: gradeQuestion(q, value) };
      }),
    });
    setPhase("done");
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-col gap-4">
        <span><Badge tone="success">نشاط مفتوح الآن</Badge></span>
        {activity.description && (
          <p className="text-body text-on-dark-muted break-words">{activity.description}</p>
        )}
        <p className="text-body">يحتوي النشاط على {questions.length} {questions.length === 1 ? "سؤال" : "أسئلة"}.</p>
        {existing && (
          <p className="text-caption text-gold">لديك إجابة سابقة — إعادة الإرسال ستحل محلها.</p>
        )}
        <Button variant="primary" fullWidth onClick={() => { setError(null); setPhase("run"); }}>
          {existing ? "إعادة النشاط" : "ابدأ النشاط"}
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-pill bg-mint/15 text-mint text-h2">✓</span>
        <h3 className="text-h2">تم إرسال إجاباتك تجريبيًا</h3>
        <p className="text-body text-on-dark-muted">شكرًا لك! يستطيع معلمك الآن رؤية إجاباتك.</p>
        <Button variant="primary" fullWidth onClick={onClose}>إغلاق</Button>
      </div>
    );
  }

  const q = questions[step];
  const isLast = step === questions.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-on-dark-muted">{step + 1} من {questions.length}</span>
        <Badge tone="purple">{QUESTION_TYPE_LABEL[q.type]}</Badge>
      </div>

      {/* progress */}
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-white/10">
        <div
          className="h-full rounded-pill bg-purple-soft transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-surface-raised p-4">
        <p className="text-card-title font-bold break-words">
          {q.prompt}
          {q.required && <span className="text-coral"> *</span>}
        </p>
        <QuestionView question={q} value={values[q.questionId]} onChange={(v) => setValue(q.questionId, v)} />
      </div>

      {error && <Badge tone="danger">{error}</Badge>}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={step === 0} onClick={() => { setError(null); setStep((s) => s - 1); }}>
          السابق
        </Button>
        {isLast ? (
          <Button variant="primary" size="sm" onClick={submit}>إرسال</Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => { setError(null); setStep((s) => s + 1); }}>التالي</Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- per-type input */

function QuestionView({
  question,
  value,
  onChange,
}: {
  question: ActivityQuestion;
  value: QuestionValue;
  onChange: (value: QuestionValue) => void;
}) {
  switch (question.type) {
    case "single_choice":
      return <ChoiceButtons options={question.options ?? []} value={value as string} onChange={onChange} />;
    case "true_false":
      return <ChoiceButtons options={["صح", "خطأ"]} optionValues={["true", "false"]} value={value as string} onChange={onChange} big />;
    case "short_answer":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="اكتب إجابتك هنا"
          rows={3}
          className="min-h-20 w-full rounded-md border border-white/10 bg-surface px-4 py-2 text-body text-on-dark outline-none transition focus:border-purple-soft"
        />
      );
    case "task_acknowledgement": {
      const v = (value as { acknowledged: boolean; note?: string }) ?? { acknowledged: false };
      return (
        <div className="flex flex-col gap-3">
          <Button
            variant={v.acknowledged ? "secondary" : "primary"}
            onClick={() => onChange({ ...v, acknowledged: !v.acknowledged })}
          >
            {v.acknowledged ? "✓ تم التنفيذ" : "تم التنفيذ"}
          </Button>
          <textarea
            value={v.note ?? ""}
            onChange={(e) => onChange({ ...v, note: e.target.value })}
            placeholder="ملاحظة اختيارية"
            rows={2}
            className="min-h-16 w-full rounded-md border border-white/10 bg-surface px-4 py-2 text-body text-on-dark outline-none transition focus:border-purple-soft"
          />
        </div>
      );
    }
    case "ordering":
      return <OrderingInput items={(value as string[]) ?? []} onChange={onChange} />;
    case "matching":
      return (
        <MatchingInput
          leftItems={question.leftItems ?? []}
          rightItems={question.rightItems ?? []}
          value={(value as MatchPair[]) ?? []}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

function ChoiceButtons({
  options,
  optionValues,
  value,
  onChange,
  big,
}: {
  options: string[];
  optionValues?: string[];
  value: string;
  onChange: (value: string) => void;
  big?: boolean;
}) {
  return (
    <div className={cn("grid gap-2", big && "grid-cols-2")}>
      {options.map((opt, i) => {
        const v = optionValues ? optionValues[i] : opt;
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "min-h-11 w-full rounded-md border px-4 text-start text-body font-bold transition",
              big && "min-h-16 text-center text-card-title",
              selected
                ? "border-purple-soft bg-purple/15 text-on-dark"
                : "border-white/10 bg-surface text-on-dark-muted hover:text-on-dark",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
