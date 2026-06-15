"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import {
  lessonPrepTitle,
  REQUIREMENT_LABEL,
  savePrep,
  SUBJECTS,
  SUBMISSION_LABEL,
  useAllPreps,
  type LessonPrepStatus,
  type RequirementType,
  type SubmissionType,
} from "@/lib/demo/lessonPrep";

const inputClass =
  "min-h-11 w-full rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";

export function PrepForm({
  teacherId,
  halaqaId,
  halaqaName,
}: {
  teacherId: string;
  halaqaId: string;
  halaqaName: string;
}) {
  const preps = useAllPreps().filter((p) => p.halaqaId === halaqaId);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [surahOrTopic, setSurahOrTopic] = useState("");
  const [ayahFrom, setAyahFrom] = useState("");
  const [ayahTo, setAyahTo] = useState("");
  const [objective, setObjective] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [lessonStatus, setLessonStatus] = useState<LessonPrepStatus>("today");
  const [lessonDate, setLessonDate] = useState("");
  const [requirementType, setRequirementType] = useState<RequirementType>("recitation");
  const [submissionType, setSubmissionType] = useState<SubmissionType>("audio_or_video");
  const [dueLabel, setDueLabel] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && !surahOrTopic.trim()) {
      setMessage("أدخل عنوان الدرس أو السورة/الموضوع.");
      return;
    }
    savePrep({
      teacherId,
      halaqaId,
      title: title.trim(),
      subject,
      surahOrTopic: surahOrTopic.trim(),
      ayahFrom: ayahFrom.trim() || undefined,
      ayahTo: ayahTo.trim() || undefined,
      objective: objective.trim() || undefined,
      studentNotes: studentNotes.trim() || undefined,
      lessonDate: lessonDate.trim() || (lessonStatus === "today" ? "اليوم" : "قريبًا"),
      lessonStatus,
      requirementType,
      submissionType,
      dueLabel: dueLabel.trim() || undefined,
    });
    setMessage("تم حفظ التحضير تجريبيًا وسيظهر للطلاب.");
    setTitle("");
    setSurahOrTopic("");
    setAyahFrom("");
    setAyahTo("");
    setObjective("");
    setStudentNotes("");
    setDueLabel("");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <SectionTitle title="تحضير درس جديد" subtitle={`الحلقة: ${halaqaName}`} />
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>عنوان الدرس</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: درس سورة الملك" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>المادة</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass}>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>السورة أو الموضوع</span>
              <input value={surahOrTopic} onChange={(e) => setSurahOrTopic(e.target.value)} placeholder="مثال: سورة الملك" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>من آية</span>
              <input value={ayahFrom} onChange={(e) => setAyahFrom(e.target.value)} inputMode="numeric" placeholder="1" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>إلى آية</span>
              <input value={ayahTo} onChange={(e) => setAyahTo(e.target.value)} inputMode="numeric" placeholder="5" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>هدف الدرس</span>
              <input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="مثال: إتقان التلاوة مع المدود" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>ملاحظات للطلاب</span>
              <input value={studentNotes} onChange={(e) => setStudentNotes(e.target.value)} placeholder="مثال: راجعوا قبل الحلقة" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>توقيت الدرس</span>
              <select value={lessonStatus} onChange={(e) => setLessonStatus(e.target.value as LessonPrepStatus)} className={inputClass}>
                <option value="today">درس اليوم</option>
                <option value="upcoming">درس قادم</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>موعد الدرس</span>
              <input value={lessonDate} onChange={(e) => setLessonDate(e.target.value)} placeholder="مثال: اليوم 6:30 م" className={inputClass} />
            </label>
          </div>

          <SectionTitle title="المطلوب من الطلاب" />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>نوع المطلوب</span>
              <select value={requirementType} onChange={(e) => setRequirementType(e.target.value as RequirementType)} className={inputClass}>
                <option value="recitation">{REQUIREMENT_LABEL.recitation}</option>
                <option value="memorization">{REQUIREMENT_LABEL.memorization}</option>
                <option value="review">{REQUIREMENT_LABEL.review}</option>
                <option value="reading">{REQUIREMENT_LABEL.reading}</option>
                <option value="none">{REQUIREMENT_LABEL.none}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>طريقة التسليم</span>
              <select value={submissionType} onChange={(e) => setSubmissionType(e.target.value as SubmissionType)} className={inputClass}>
                <option value="none">{SUBMISSION_LABEL.none}</option>
                <option value="audio">{SUBMISSION_LABEL.audio}</option>
                <option value="video">{SUBMISSION_LABEL.video}</option>
                <option value="audio_or_video">{SUBMISSION_LABEL.audio_or_video}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>موعد التسليم</span>
              <input value={dueLabel} onChange={(e) => setDueLabel(e.target.value)} placeholder="مثال: قبل الدرس القادم" className={inputClass} />
            </label>
          </div>

          <div className="sm:max-w-xs">
            <Button type="submit" variant="primary" fullWidth>حفظ التحضير</Button>
          </div>
          {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        </form>
      </Card>

      <section className="flex flex-col gap-3">
        <SectionTitle title="التحضيرات المحفوظة" subtitle="تجريبية — تظهر للطلاب" />
        {preps.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {preps.map((p) => (
              <Card key={p.lessonId} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-card-title font-bold break-words">{lessonPrepTitle(p)}</span>
                  <Badge tone={p.lessonStatus === "today" ? "success" : "purple"}>
                    {p.lessonStatus === "today" ? "درس اليوم" : "درس قادم"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="neutral">{p.subject}</Badge>
                  {p.requirementType !== "none" && <Badge tone="purple">{REQUIREMENT_LABEL[p.requirementType]}</Badge>}
                  {p.requirementType !== "none" && <Badge tone="neutral">{SUBMISSION_LABEL[p.submissionType]}</Badge>}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card><p className="text-body text-on-dark-muted">لا تحضيرات محفوظة بعد.</p></Card>
        )}
      </section>
    </div>
  );
}
