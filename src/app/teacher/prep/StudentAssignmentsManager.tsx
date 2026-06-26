"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import {
  addAssignment,
  ASSIGNMENT_SUBMISSION_LABEL,
  ASSIGNMENT_TYPE_LABEL,
  setAssignmentStatus,
  useAssignmentsForHalaqa,
  type AssignmentStatus,
  type AssignmentSubmissionType,
  type AssignmentType,
  type StudentAssignment,
} from "@/lib/demo/studentAssignments";
import { useSubmissions } from "@/lib/demo/submissions";
import { useMaterialsForHalaqa } from "@/lib/demo/materials";
import { useLessonsForMaterial, type LessonSubmissionType } from "@/lib/demo/materialLessons";

/** Map a lesson's allowed submission types → the assignment submission type. */
function lessonToSubmissionType(allowed: LessonSubmissionType[]): AssignmentSubmissionType {
  const audio = allowed.includes("audio");
  const video = allowed.includes("video");
  if (audio && video) return "audio_or_video";
  if (video) return "video";
  if (audio) return "audio";
  return "none";
}

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  active: "نشطة",
  closed: "مغلقة",
  archived: "مؤرشفة",
};
const STATUS_TONE: Record<AssignmentStatus, "success" | "neutral"> = {
  active: "success",
  closed: "neutral",
  archived: "neutral",
};

function dayLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar", { day: "2-digit", month: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Teacher · "مهام الطلاب" — independent from lesson prep. Each add is a new card.
 * Active assignments surface on /child/tasks and flow through the existing
 * parent-approval / teacher-review workflow (recording assignments).
 */
export function StudentAssignmentsManager({
  teacherId,
  halaqaId,
}: {
  teacherId: string;
  halaqaId: string;
}) {
  const assignments = useAssignmentsForHalaqa(halaqaId);
  const submissions = useSubmissions();
  const materials = useMaterialsForHalaqa(halaqaId);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AssignmentType>("recitation");
  const [submissionType, setSubmissionType] = useState<AssignmentSubmissionType>("audio_or_video");
  const [dueLabel, setDueLabel] = useState("");

  // Phase C: optional material + saved-lesson link.
  const [materialId, setMaterialId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [points, setPoints] = useState("");
  const lessons = useLessonsForMaterial(materialId).filter((l) => !l.archived);
  const selectedMaterial = materials.find((m) => m.id === materialId);

  function onMaterialChange(id: string) {
    setMaterialId(id);
    setLessonId("");
  }

  function onLessonChange(id: string) {
    setLessonId(id);
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) return;
    // Autofill from the lesson (teacher can still edit afterwards).
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
    setPoints(String(lesson.defaultPoints));
    setSubmissionType(lessonToSubmissionType(lesson.allowedSubmissionTypes));
  }

  const active = assignments.filter((a) => a.status === "active");
  const closed = assignments.filter((a) => a.status !== "active");

  const renderCard = (a: StudentAssignment) => {
    const submitted = Object.values(submissions).filter((s) => s.taskId === a.id).length;
    return (
      <Card key={a.id} className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-card-title font-bold break-words">{a.title}</span>
          <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
        </div>
        {a.description && <p className="text-caption text-on-dark-muted break-words">{a.description}</p>}
        <div className="flex flex-wrap gap-2">
          <Badge tone="purple">{ASSIGNMENT_TYPE_LABEL[a.type]}</Badge>
          <Badge tone="neutral">{ASSIGNMENT_SUBMISSION_LABEL[a.submissionType]}</Badge>
          {a.dueLabel && <Badge tone="neutral">{a.dueLabel}</Badge>}
          <Badge tone="neutral">أُنشئت: {dayLabel(a.createdAt)}</Badge>
          {submitted > 0 && <Badge tone="gold">أرسلها {submitted}</Badge>}
        </div>
        {a.status === "active" && (
          <div className="sm:max-w-[10rem]">
            <Button variant="secondary" size="sm" fullWidth onClick={() => setAssignmentStatus(a.id, "closed")}>
              إغلاق المهمة
            </Button>
          </div>
        )}
      </Card>
    );
  };

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("اكتب عنوان المهمة.");
      return;
    }
    const lesson = lessons.find((l) => l.id === lessonId);
    addAssignment({
      teacherId,
      halaqaId,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      submissionType,
      dueLabel: dueLabel.trim() || undefined,
      materialId: materialId || undefined,
      lessonId: lessonId || undefined,
      points: points.trim() !== "" ? Number(points) : undefined,
      materialName: selectedMaterial?.name,
      lessonTitle: lesson?.title,
    });
    setMessage("تمت إضافة المهمة وستظهر للطلاب.");
    setTitle("");
    setDescription("");
    setDueLabel("");
    setMaterialId("");
    setLessonId("");
    setPoints("");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <SectionTitle title="مهام الطلاب" subtitle="مستقلة عن تحضير الدرس — أضِف المطلوب في أي وقت" />
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phase C: pick a material + saved lesson to auto-fill the task. */}
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>المادة (اختياري)</span>
              <select value={materialId} onChange={(e) => onMaterialChange(e.target.value)} className={inputClass}>
                <option value="">— بدون مادة —</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>الدرس المحفوظ (اختياري)</span>
              <select value={lessonId} onChange={(e) => onLessonChange(e.target.value)} disabled={!materialId} className={inputClass}>
                <option value="">{materialId ? "— اختر درسًا —" : "اختر مادة أولًا"}</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </label>
            <p className="text-caption text-on-dark-muted sm:col-span-2">
              الدروس تأتي من صفحة المواد والتقدّم. يمكنك تعديل الدروس{" "}
              <Link href="/teacher/materials" className="font-bold text-purple-soft underline">من هناك</Link>.
            </p>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>عنوان المهمة</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: سمّع سورة الملك 1-10" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>وصف بسيط (اختياري)</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="مثال: راجع قبل التسميع" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>نوع المهمة</span>
              <select value={type} onChange={(e) => setType(e.target.value as AssignmentType)} className={inputClass}>
                <option value="recitation">{ASSIGNMENT_TYPE_LABEL.recitation}</option>
                <option value="memorization">{ASSIGNMENT_TYPE_LABEL.memorization}</option>
                <option value="review">{ASSIGNMENT_TYPE_LABEL.review}</option>
                <option value="reading">{ASSIGNMENT_TYPE_LABEL.reading}</option>
                <option value="confirm">{ASSIGNMENT_TYPE_LABEL.confirm}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>طريقة التسليم</span>
              <select value={submissionType} onChange={(e) => setSubmissionType(e.target.value as AssignmentSubmissionType)} className={inputClass}>
                <option value="none">{ASSIGNMENT_SUBMISSION_LABEL.none}</option>
                <option value="audio">{ASSIGNMENT_SUBMISSION_LABEL.audio}</option>
                <option value="video">{ASSIGNMENT_SUBMISSION_LABEL.video}</option>
                <option value="audio_or_video">{ASSIGNMENT_SUBMISSION_LABEL.audio_or_video}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className={fieldLabel}>نقاط المهمة (اختياري)</span>
              <input type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="من الدرس" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={fieldLabel}>موعد التسليم (اختياري)</span>
              <input value={dueLabel} onChange={(e) => setDueLabel(e.target.value)} placeholder="مثال: قبل الدرس القادم" className={inputClass} />
            </label>
          </div>
          <div className="sm:max-w-xs">
            <Button type="submit" variant="primary" fullWidth>إضافة مهمة</Button>
          </div>
          {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        </form>
      </Card>

      <section className="flex flex-col gap-3">
        <SectionTitle title="مهام نشطة" subtitle="تظهر للطلاب الآن" />
        {active.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">{active.map(renderCard)}</div>
        ) : (
          <Card><p className="text-body text-on-dark-muted">لا مهام نشطة بعد — أضِف أول مهمة.</p></Card>
        )}
      </section>

      {closed.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle title="مهام مغلقة" subtitle="لا تظهر للطلاب — محفوظة هنا" />
          <div className="grid gap-3 lg:grid-cols-2">{closed.map(renderCard)}</div>
        </section>
      )}
    </div>
  );
}
