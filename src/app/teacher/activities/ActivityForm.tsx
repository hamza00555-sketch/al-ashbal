"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import {
  ACTIVITY_TYPE_LABEL,
  createActivity,
  newQuestionId,
  QUESTION_TYPE_LABEL,
  type ActivityQuestion,
  type ActivityType,
  type QuestionType,
} from "@/lib/demo/activities";
import type { HalaqaChild } from "./ActivitiesManager";

const inputClass =
  "min-h-11 w-full rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";

const ACTIVITY_TYPES: ActivityType[] = [
  "quick_question",
  "short_quiz",
  "memorization_challenge",
  "group_activity",
];
const QUESTION_TYPES: QuestionType[] = [
  "single_choice",
  "true_false",
  "short_answer",
  "task_acknowledgement",
  "ordering",
];

export function ActivityForm({
  teacherId,
  teacherName,
  halaqaId,
  halaqaName,
  halaqaChildren,
  hasActive,
}: {
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  halaqaName: string;
  halaqaChildren: HalaqaChild[];
  hasActive: boolean;
}) {
  // Activity-level fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityType>("quick_question");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [questions, setQuestions] = useState<ActivityQuestion[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Draft (the question currently being built)
  const [qType, setQType] = useState<QuestionType>("single_choice");
  const [qPrompt, setQPrompt] = useState("");
  const [qRequired, setQRequired] = useState(true);
  const [qOptions, setQOptions] = useState<string[]>(["", ""]);
  const [qCorrect, setQCorrect] = useState("");
  const [qItems, setQItems] = useState<string[]>(["", ""]);
  const [qError, setQError] = useState<string | null>(null);

  function resetDraft() {
    setQPrompt("");
    setQRequired(true);
    setQOptions(["", ""]);
    setQCorrect("");
    setQItems(["", ""]);
    setQError(null);
  }

  function changeType(t: QuestionType) {
    setQType(t);
    resetDraft();
  }

  const cleanOptions = qOptions.map((o) => o.trim()).filter(Boolean);

  function addQuestion() {
    const prompt = qPrompt.trim();
    if (!prompt) {
      setQError("أدخل نص السؤال أو التعليمات.");
      return;
    }
    const base = { questionId: newQuestionId(), type: qType, prompt, required: qRequired };
    let q: ActivityQuestion;
    switch (qType) {
      case "single_choice": {
        if (cleanOptions.length < 2) {
          setQError("أضف خيارين على الأقل.");
          return;
        }
        q = { ...base, options: cleanOptions, correctAnswer: cleanOptions.includes(qCorrect) ? qCorrect : undefined };
        break;
      }
      case "true_false":
        q = { ...base, correctAnswer: qCorrect === "true" || qCorrect === "false" ? qCorrect : undefined };
        break;
      case "short_answer":
      case "task_acknowledgement":
        q = { ...base };
        break;
      case "ordering": {
        const items = qItems.map((i) => i.trim()).filter(Boolean);
        if (items.length < 2) {
          setQError("أضف عنصرين على الأقل للترتيب.");
          return;
        }
        q = { ...base, items, correctOrder: items };
        break;
      }
      default:
        return;
    }
    setQuestions((prev) => [...prev, q]);
    resetDraft();
    setMessage(null);
  }

  function activate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("أدخل عنوان النشاط.");
      return;
    }
    if (questions.length === 0) {
      setMessage("أضف سؤالًا واحدًا على الأقل قبل التفعيل.");
      return;
    }
    createActivity({
      teacherId,
      teacherName,
      halaqaId,
      title: title.trim(),
      type,
      description: description.trim(),
      durationMinutes: duration.trim() ? Number(duration) : undefined,
      questions,
    });
    for (const child of halaqaChildren) {
      if (!child.userId) continue;
      pushNotification({
        userId: child.userId,
        title: "نشاط جديد مفتوح الآن",
        body: title.trim(),
        type: "activity_open",
        href: "/child",
      });
    }
    setMessage(hasActive ? "تم تفعيل النشاط الجديد وأُغلق السابق." : "تم تفعيل النشاط وظهر للطلاب.");
    setTitle("");
    setDescription("");
    setDuration("");
    setQuestions([]);
    resetDraft();
  }

  return (
    <Card className="flex flex-col gap-5">
      <SectionTitle title="إنشاء نشاط جديد" subtitle={`الحلقة: ${halaqaName}`} />

      {/* Activity info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>عنوان النشاط</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مراجعة درس اليوم" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>نوع النشاط</span>
          <select value={type} onChange={(e) => setType(e.target.value as ActivityType)} className={inputClass}>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>{ACTIVITY_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={fieldLabel}>وصف النشاط (اختياري)</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر" className={inputClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>مدة النشاط بالدقائق (اختياري)</span>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" placeholder="مثال: 5" className={inputClass} />
        </label>
      </div>

      {/* Added questions */}
      <div className="flex flex-col gap-3">
        <SectionTitle title="الأسئلة" subtitle={`${questions.length} سؤال`} />
        {questions.length > 0 && (
          <div className="grid gap-2 lg:grid-cols-2">
            {questions.map((q, i) => (
              <Card key={q.questionId} variant="raised" className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-body font-bold break-words">{i + 1}. {q.prompt}</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="purple">{QUESTION_TYPE_LABEL[q.type]}</Badge>
                    {q.required && <Badge tone="neutral">مطلوب</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setQuestions((prev) => prev.filter((x) => x.questionId !== q.questionId))}>
                  حذف
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Draft question editor */}
      <Card variant="raised" className="flex flex-col gap-4">
        <span className="text-card-title font-bold">إضافة سؤال</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={fieldLabel}>نوع السؤال</span>
            <select value={qType} onChange={(e) => changeType(e.target.value as QuestionType)} className={inputClass}>
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>{QUESTION_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 sm:mt-7">
            <input type="checkbox" checked={qRequired} onChange={(e) => setQRequired(e.target.checked)} className="size-4 accent-[var(--color-purple)]" />
            <span className="text-body">سؤال مطلوب</span>
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className={fieldLabel}>{qType === "task_acknowledgement" ? "التعليمات" : "نص السؤال"}</span>
            <textarea value={qPrompt} onChange={(e) => setQPrompt(e.target.value)} rows={2} placeholder={qType === "ordering" ? "مثال: رتب خطوات الوضوء" : "اكتب السؤال"} className={`${inputClass} min-h-16 py-2`} />
          </label>
        </div>

        {qType === "single_choice" && (
          <div className="flex flex-col gap-2">
            <span className={fieldLabel}>الخيارات (2 إلى 4)</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {qOptions.map((opt, i) => (
                <input key={i} value={opt} onChange={(e) => setQOptions((p) => p.map((o, idx) => (idx === i ? e.target.value : o)))} placeholder={`الخيار ${i + 1}`} className={inputClass} />
              ))}
            </div>
            {qOptions.length < 4 && (
              <div className="sm:max-w-xs">
                <Button type="button" variant="ghost" size="sm" onClick={() => setQOptions((p) => [...p, ""])}>إضافة خيار</Button>
              </div>
            )}
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>الإجابة الصحيحة (اختياري)</span>
              <select value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} className={inputClass}>
                <option value="">— بدون —</option>
                {cleanOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {qType === "true_false" && (
          <label className="flex flex-col gap-2 sm:max-w-xs">
            <span className={fieldLabel}>الإجابة الصحيحة (اختياري)</span>
            <select value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} className={inputClass}>
              <option value="">— بدون —</option>
              <option value="true">صح</option>
              <option value="false">خطأ</option>
            </select>
          </label>
        )}

        {qType === "ordering" && (
          <div className="flex flex-col gap-2">
            <span className={fieldLabel}>عناصر الترتيب (بالترتيب الصحيح)</span>
            {qItems.map((it, i) => (
              <input key={i} value={it} onChange={(e) => setQItems((p) => p.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder={`العنصر ${i + 1}`} className={inputClass} />
            ))}
            {qItems.length < 6 && (
              <div className="sm:max-w-xs">
                <Button type="button" variant="ghost" size="sm" onClick={() => setQItems((p) => [...p, ""])}>إضافة عنصر</Button>
              </div>
            )}
            <p className="text-caption text-on-dark-muted">يُحفظ الترتيب الحالي كترتيب صحيح، ويُعرض للطفل بترتيب مختلف.</p>
          </div>
        )}

        {qError && <Badge tone="danger">{qError}</Badge>}
        <div className="sm:max-w-xs">
          <Button type="button" variant="secondary" fullWidth onClick={addQuestion}>إضافة السؤال</Button>
        </div>
      </Card>

      <form onSubmit={activate} className="flex flex-col gap-3">
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth>تفعيل النشاط</Button>
        </div>
        {message && <p className="text-caption text-on-dark-muted">{message}</p>}
      </form>
    </Card>
  );
}
