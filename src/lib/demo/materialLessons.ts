"use client";

/*
  الأشبال — DEMO material-lessons store (Phase B5).

  Saved "lessons / content" inside a learning material (e.g. القرآن → سورة
  الملك 1-5). For now these are ONLY managed by the teacher; they do NOT yet
  link to tasks and do NOT affect /child/progress. localStorage only, no
  backend. Keyed by materialId, with a few demo seeds for the default
  materials (materialized into storage on first edit).
*/
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { MaterialType } from "./materials";

export type LessonSubmissionType = "audio" | "video" | "parent_check" | "teacher_check";

export const LESSON_SUBMISSION_LABEL: Record<LessonSubmissionType, string> = {
  audio: "صوت",
  video: "فيديو",
  parent_check: "تأكيد ولي الأمر",
  teacher_check: "تقييم المعلم",
};

export interface MaterialLesson {
  id: string;
  materialId: string;
  title: string;
  description?: string;
  surahOrTopic?: string;
  verseStart?: number;
  verseEnd?: number;
  defaultPoints: number;
  allowedSubmissionTypes: LessonSubmissionType[];
  order: number;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

const TS = "2026-01-01T00:00:00.000Z";

/** A few demo lessons per material TYPE (no over-seeding). */
const LESSON_SEED: Partial<
  Record<MaterialType, Array<Omit<MaterialLesson, "id" | "materialId" | "order" | "createdAt" | "updatedAt">>>
> = {
  quran: [
    { title: "سورة الملك 1-5", surahOrTopic: "سورة الملك", verseStart: 1, verseEnd: 5, defaultPoints: 5, allowedSubmissionTypes: ["audio", "video"] },
  ],
  tajweed: [
    { title: "الإظهار", surahOrTopic: "الإظهار", defaultPoints: 3, allowedSubmissionTypes: ["audio", "teacher_check"] },
  ],
  behavior: [
    { title: "أدب الاستئذان", surahOrTopic: "أدب الاستئذان", defaultPoints: 2, allowedSubmissionTypes: ["parent_check", "teacher_check"] },
  ],
};

/** Default-material ids look like `mat-<halaqa>-<type>`; recover the type. */
function typeFromMaterialId(materialId: string): MaterialType | undefined {
  const suffix = materialId.split("-").pop() ?? "";
  return (suffix in LESSON_SEED ? (suffix as MaterialType) : undefined);
}

function defaultLessons(materialId: string): MaterialLesson[] {
  const type = typeFromMaterialId(materialId);
  const seed = type ? LESSON_SEED[type] : undefined;
  if (!seed) return [];
  return seed.map((s, i) => ({
    ...s,
    id: `les-${materialId}-${i + 1}`,
    materialId,
    order: i + 1,
    archived: false,
    createdAt: TS,
    updatedAt: TS,
  }));
}

const KEY = "alashbal:material-lessons";
const EVENT = "alashbal:material-lessons-changed";
const EMPTY: MaterialLesson[] = [];

function readAll(): MaterialLesson[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MaterialLesson[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: MaterialLesson[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Lessons for a material, materialized from the demo seed the first time. */
function lessonsOf(all: MaterialLesson[], materialId: string): MaterialLesson[] {
  const mine = all.filter((l) => l.materialId === materialId);
  return mine.length > 0 ? mine : defaultLessons(materialId);
}

/** All lessons for a material incl. archived, ordered. */
export function getLessonsForMaterial(materialId: string): MaterialLesson[] {
  return [...lessonsOf(readAll(), materialId)].sort((a, b) => a.order - b.order);
}

function mutate(materialId: string, fn: (items: MaterialLesson[]) => MaterialLesson[]) {
  const all = readAll();
  const others = all.filter((l) => l.materialId !== materialId);
  const mine = lessonsOf(all, materialId).map((l) => ({ ...l }));
  writeAll([...others, ...fn(mine)]);
}

// ---- mutations -------------------------------------------------------------

export interface NewLessonInput {
  title: string;
  description?: string;
  surahOrTopic?: string;
  verseStart?: number;
  verseEnd?: number;
  defaultPoints: number;
  allowedSubmissionTypes: LessonSubmissionType[];
}

export function addMaterialLesson(materialId: string, input: NewLessonInput): void {
  mutate(materialId, (items) => {
    const maxOrder = items.reduce((m, x) => Math.max(m, x.order), 0);
    const now = new Date().toISOString();
    const lesson: MaterialLesson = {
      id: `les-${materialId}-${Date.now()}`,
      materialId,
      title: input.title.trim() || "درس",
      description: input.description?.trim() || undefined,
      surahOrTopic: input.surahOrTopic?.trim() || undefined,
      verseStart: input.verseStart,
      verseEnd: input.verseEnd,
      defaultPoints: Math.max(0, Math.round(input.defaultPoints) || 0),
      allowedSubmissionTypes: input.allowedSubmissionTypes,
      order: maxOrder + 1,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    return [...items, lesson];
  });
}

export type LessonPatch = Partial<
  Pick<
    MaterialLesson,
    "title" | "description" | "surahOrTopic" | "verseStart" | "verseEnd" | "defaultPoints" | "allowedSubmissionTypes"
  >
>;

export function updateMaterialLesson(materialId: string, id: string, patch: LessonPatch): void {
  mutate(materialId, (items) =>
    items.map((l) => {
      if (l.id !== id) return l;
      const next: MaterialLesson = { ...l, ...patch, updatedAt: new Date().toISOString() };
      if (patch.title !== undefined) next.title = patch.title.trim() || l.title;
      if (patch.defaultPoints !== undefined) next.defaultPoints = Math.max(0, Math.round(patch.defaultPoints) || 0);
      return next;
    }),
  );
}

export function setLessonArchived(materialId: string, id: string, archived: boolean): void {
  mutate(materialId, (items) =>
    items.map((l) => (l.id === id ? { ...l, archived, updatedAt: new Date().toISOString() } : l)),
  );
}
export const archiveMaterialLesson = (materialId: string, id: string) => setLessonArchived(materialId, id, true);
export const restoreMaterialLesson = (materialId: string, id: string) => setLessonArchived(materialId, id, false);

function moveLesson(materialId: string, id: string, dir: "up" | "down"): void {
  mutate(materialId, (items) => {
    const active = items.filter((l) => !l.archived).sort((a, b) => a.order - b.order);
    const i = active.findIndex((l) => l.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= active.length) return items;
    const a = active[i];
    const b = active[j];
    return items.map((l) =>
      l.id === a.id ? { ...l, order: b.order } : l.id === b.id ? { ...l, order: a.order } : l,
    );
  });
}
export const moveLessonUp = (materialId: string, id: string) => moveLesson(materialId, id, "up");
export const moveLessonDown = (materialId: string, id: string) => moveLesson(materialId, id, "down");

// ---- reactive hook ---------------------------------------------------------

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const defaultsCache = new Map<string, MaterialLesson[]>();
function stableDefaults(materialId: string): MaterialLesson[] {
  let v = defaultsCache.get(materialId);
  if (!v) {
    v = defaultLessons(materialId);
    defaultsCache.set(materialId, v);
  }
  return v;
}

export function useLessonsForMaterial(materialId: string): MaterialLesson[] {
  const cache = useRef<{ sig: string; value: MaterialLesson[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): MaterialLesson[] => {
    const list = getLessonsForMaterial(materialId);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [materialId]);
  const getServerSnapshot = useCallback(() => stableDefaults(materialId), [materialId]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
