"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import { pushNotification } from "@/lib/demo/notifications";
import {
  ACTIVITY_TYPE_LABEL,
  closeActivity,
  createActivity,
  useActiveActivityForHalaqa,
  useAnswersForActivity,
  useTeacherActivities,
  type Activity,
  type ActivityType,
} from "@/lib/demo/activities";

export interface HalaqaChild {
  id: string;
  name: string;
  userId: string;
}

const inputClass =
  "min-h-11 w-full rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";

const TYPE_ORDER: ActivityType[] = [
  "quick_question",
  "short_quiz",
  "memorization_challenge",
  "group_activity",
];

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
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
  // Whose answers to show: the active activity, else the most recent one.
  const current = active ?? teacherActivities.find((a) => a.halaqaId === halaqaId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {active && (
        <ActiveActivityCard activity={active} halaqaChildren={halaqaChildren} />
      )}
      <ActivityForm
        teacherId={teacherId}
        teacherName={teacherName}
        halaqaId={halaqaId}
        halaqaName={halaqaName}
        halaqaChildren={halaqaChildren}
        hasActive={Boolean(active)}
      />
      {current && <StudentAnswers activity={current} halaqaChildren={halaqaChildren} />}
    </div>
  );
}

/* ------------------------------------------------------------------ the form */

function ActivityForm({
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
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityType>("quick_question");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [duration, setDuration] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

  function setOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function activate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) {
      setMessage("أدخل عنوان النشاط والسؤال أو التعليمات.");
      return;
    }
    const correct = correctAnswer.trim();
    createActivity({
      teacherId,
      teacherName,
      halaqaId,
      title: title.trim(),
      type,
      description: description.trim(),
      prompt: prompt.trim(),
      options: cleanOptions,
      correctAnswer: correct && cleanOptions.includes(correct) ? correct : undefined,
      durationMinutes: duration.trim() ? Number(duration) : undefined,
    });
    // Notify every child in this halaqa (demo notifications store).
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
    setPrompt("");
    setOptions(["", ""]);
    setCorrectAnswer("");
    setDuration("");
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionTitle title="إنشاء نشاط جديد" subtitle={`الحلقة: ${halaqaName}`} />
      <form onSubmit={activate} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={fieldLabel}>عنوان النشاط</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: سؤال عن حكم النون الساكنة" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={fieldLabel}>نوع النشاط</span>
            <select value={type} onChange={(e) => setType(e.target.value as ActivityType)} className={inputClass}>
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>{ACTIVITY_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className={fieldLabel}>وصف النشاط</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر للنشاط" className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className={fieldLabel}>السؤال أو التعليمات</span>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="اكتب السؤال أو تعليمات النشاط" rows={2} className={`${inputClass} min-h-20 py-2`} />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>خيارات الإجابة (اختياري — للاختيار من متعدد)</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`الخيار ${i + 1}`}
                className={inputClass}
              />
            ))}
          </div>
          {options.length < 6 && (
            <div className="sm:max-w-xs">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOptions((p) => [...p, ""])}>
                إضافة خيار
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={fieldLabel}>الإجابة الصحيحة (اختياري)</span>
            {cleanOptions.length > 0 ? (
              <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className={inputClass}>
                <option value="">— بدون —</option>
                {cleanOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="تُترك فارغة في النسخة التجريبية" className={inputClass} disabled />
            )}
          </label>
          <label className="flex flex-col gap-2">
            <span className={fieldLabel}>مدة النشاط بالدقائق (اختياري)</span>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} inputMode="numeric" placeholder="مثال: 5" className={inputClass} />
          </label>
        </div>

        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth>تفعيل النشاط</Button>
        </div>
        {message && <p className="text-caption text-on-dark-muted">{message}</p>}
      </form>
    </Card>
  );
}

/* -------------------------------------------------------- active activity card */

function ActiveActivityCard({
  activity,
  halaqaChildren,
}: {
  activity: Activity;
  halaqaChildren: HalaqaChild[];
}) {
  function close() {
    closeActivity(activity.activityId);
    for (const child of halaqaChildren) {
      if (!child.userId) continue;
      pushNotification({
        userId: child.userId,
        title: "انتهى النشاط",
        body: `انتهى نشاط: ${activity.title}`,
        type: "activity_closed",
      });
    }
  }

  return (
    <Card variant="gradient" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span><Badge tone="success">مفعّل الآن</Badge></span>
        <Badge tone="purple">{ACTIVITY_TYPE_LABEL[activity.type]}</Badge>
      </div>
      <h2 className="text-h2 break-words">{activity.title}</h2>
      {activity.description && (
        <p className="text-body text-on-dark-muted break-words">{activity.description}</p>
      )}
      <p className="text-body break-words">{activity.prompt}</p>
      {activity.options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activity.options.map((o) => (
            <Badge key={o} tone="neutral">{o}</Badge>
          ))}
        </div>
      )}
      {activity.durationMinutes ? (
        <span className="text-caption text-on-dark-muted">المدة: {activity.durationMinutes} دقيقة</span>
      ) : null}
      <div className="sm:max-w-xs">
        <Button variant="danger" fullWidth onClick={close}>إغلاق النشاط</Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------- student answers */

function StudentAnswers({
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
          {halaqaChildren.map((child) => {
            const ans = byChild.get(child.id);
            return (
              <Card key={child.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-card-title font-bold break-words">{child.name}</span>
                  {ans ? (
                    <Badge tone="success">أجاب</Badge>
                  ) : (
                    <Badge tone="neutral">لم يجب بعد</Badge>
                  )}
                </div>
                {ans && (
                  <>
                    <p className="text-body text-on-dark-muted break-words">{ans.answer}</p>
                    <span className="text-caption text-on-dark-muted">وقت الإرسال: {timeLabel(ans.submittedAt)}</span>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><p className="text-body text-on-dark-muted">لا يوجد أطفال في الحلقة.</p></Card>
      )}
    </section>
  );
}
