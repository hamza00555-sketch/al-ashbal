"use client";

import { useState } from "react";
import { Badge, Button } from "@/components";
import {
  addMaterialLesson,
  archiveMaterialLesson,
  LESSON_SUBMISSION_LABEL,
  moveLessonDown,
  moveLessonUp,
  restoreMaterialLesson,
  updateMaterialLesson,
  useLessonsForMaterial,
  type LessonSubmissionType,
  type MaterialLesson,
} from "@/lib/demo/materialLessons";

const inputClass =
  "min-h-10 w-full rounded-md border border-white/10 bg-surface-raised px-3 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";
const SUB_TYPES = Object.keys(LESSON_SUBMISSION_LABEL) as LessonSubmissionType[];

interface DraftState {
  title: string;
  description: string;
  surahOrTopic: string;
  verseStart: string;
  verseEnd: string;
  defaultPoints: string;
  allowed: LessonSubmissionType[];
}

function emptyDraft(): DraftState {
  return { title: "", description: "", surahOrTopic: "", verseStart: "", verseEnd: "", defaultPoints: "1", allowed: ["audio"] };
}
function draftFrom(l: MaterialLesson): DraftState {
  return {
    title: l.title,
    description: l.description ?? "",
    surahOrTopic: l.surahOrTopic ?? "",
    verseStart: l.verseStart != null ? String(l.verseStart) : "",
    verseEnd: l.verseEnd != null ? String(l.verseEnd) : "",
    defaultPoints: String(l.defaultPoints),
    allowed: l.allowedSubmissionTypes,
  };
}
function toInput(d: DraftState) {
  const num = (s: string) => (s.trim() === "" ? undefined : Number(s));
  return {
    title: d.title,
    description: d.description.trim() || undefined,
    surahOrTopic: d.surahOrTopic.trim() || undefined,
    verseStart: num(d.verseStart),
    verseEnd: num(d.verseEnd),
    defaultPoints: Number(d.defaultPoints) || 0,
    allowedSubmissionTypes: d.allowed.length ? d.allowed : (["audio"] as LessonSubmissionType[]),
  };
}

/** Lesson add/edit form (shared by "new" and inline edit). */
function LessonForm({ initial, onSave, onCancel }: { initial: DraftState; onSave: (d: DraftState) => void; onCancel: () => void }) {
  const [d, setD] = useState<DraftState>(initial);
  const set = (patch: Partial<DraftState>) => setD((p) => ({ ...p, ...patch }));
  const toggle = (t: LessonSubmissionType) =>
    set({ allowed: d.allowed.includes(t) ? d.allowed.filter((x) => x !== t) : [...d.allowed, t] });

  return (
    <div className="flex flex-col gap-3 rounded-md bg-surface-raised p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={fieldLabel}>عنوان الدرس</span>
          <input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="مثال: سورة الملك 1-5" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className={fieldLabel}>وصف مختصر (اختياري)</span>
          <input value={d.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>الموضوع أو السورة</span>
          <input value={d.surahOrTopic} onChange={(e) => set({ surahOrTopic: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>النقاط الافتراضية</span>
          <input type="number" min={0} value={d.defaultPoints} onChange={(e) => set({ defaultPoints: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>من آية (اختياري)</span>
          <input type="number" min={1} value={d.verseStart} onChange={(e) => set({ verseStart: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={fieldLabel}>إلى آية (اختياري)</span>
          <input type="number" min={1} value={d.verseEnd} onChange={(e) => set({ verseEnd: e.target.value })} className={inputClass} />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>أنواع التسليم المسموحة</span>
        <div className="flex flex-wrap gap-3">
          {SUB_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-1.5">
              <input type="checkbox" checked={d.allowed.includes(t)} onChange={() => toggle(t)} className="size-4 accent-purple" />
              <span className="text-caption text-on-dark">{LESSON_SUBMISSION_LABEL[t]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={() => onSave(d)}>حفظ</Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>إلغاء</Button>
      </div>
    </div>
  );
}

export function MaterialLessons({ materialId }: { materialId: string }) {
  const lessons = useLessonsForMaterial(materialId);
  const active = lessons.filter((l) => !l.archived);
  const archived = lessons.filter((l) => l.archived);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-1 flex flex-col gap-3 rounded-md bg-night/40 p-3 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-bold text-on-dark">الدروس المحفوظة ({active.length})</span>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => { setAdding(true); setEditingId(null); }}>إضافة درس</Button>
        )}
      </div>
      <p className="text-caption text-on-dark-muted">
        الدروس هنا محفوظة للمعلم. لن تظهر للطفل إلا بعد إنشاء تكليف منها من صفحة التحضير.
      </p>

      {adding && (
        <LessonForm
          initial={emptyDraft()}
          onCancel={() => setAdding(false)}
          onSave={(d) => { addMaterialLesson(materialId, toInput(d)); setAdding(false); }}
        />
      )}

      {active.length === 0 && !adding ? (
        <p className="text-caption text-on-dark-muted">لا دروس محفوظة بعد.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {active.map((l, i) =>
            editingId === l.id ? (
              <LessonForm
                key={l.id}
                initial={draftFrom(l)}
                onCancel={() => setEditingId(null)}
                onSave={(d) => { updateMaterialLesson(materialId, l.id, toInput(d)); setEditingId(null); }}
              />
            ) : (
              <div key={l.id} className="flex flex-col gap-2 rounded-md bg-surface-raised p-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-body font-bold break-words">{l.title}</span>
                  {l.description && <span className="text-caption text-on-dark-muted break-words">{l.description}</span>}
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="gold">+{l.defaultPoints} نقطة</Badge>
                    {l.allowedSubmissionTypes.map((t) => (
                      <Badge key={t} tone="neutral">{LESSON_SUBMISSION_LABEL[t]}</Badge>
                    ))}
                    <Badge tone="neutral">الترتيب: {l.order}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingId(l.id); setAdding(false); }}>تعديل</Button>
                  <Button variant="ghost" size="sm" onClick={() => archiveMaterialLesson(materialId, l.id)}>أرشفة</Button>
                  <span className="ms-auto flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="رفع الترتيب"
                      disabled={i === 0}
                      onClick={() => moveLessonUp(materialId, l.id)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-body text-on-dark-muted transition hover:bg-white/5 hover:text-on-dark disabled:cursor-not-allowed disabled:opacity-35"
                    >↑</button>
                    <button
                      type="button"
                      aria-label="خفض الترتيب"
                      disabled={i === active.length - 1}
                      onClick={() => moveLessonDown(materialId, l.id)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-body text-on-dark-muted transition hover:bg-white/5 hover:text-on-dark disabled:cursor-not-allowed disabled:opacity-35"
                    >↓</button>
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {archived.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-caption text-on-dark-muted">دروس مؤرشفة</span>
          {archived.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-2 rounded-md bg-surface-raised px-3 py-2">
              <span className="text-caption break-words">{l.title}</span>
              <Button variant="ghost" size="sm" onClick={() => restoreMaterialLesson(materialId, l.id)}>استعادة</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
