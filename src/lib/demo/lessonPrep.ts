"use client";

/*
  الأشبال — client-side demo lesson-prep store (Phase 01 · Task A3).
  PROTOTYPE ONLY: the teacher's lesson preparation lives in localStorage so it
  can surface on the child's lessons/tasks pages and the parent's child detail
  within the same browser. Nothing is saved to a backend / the mock db.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type RequirementType = "recitation" | "memorization" | "review" | "reading" | "none";
export type SubmissionType = "none" | "audio" | "video" | "audio_or_video";
export type LessonPrepStatus = "today" | "upcoming";

export interface LessonPrep {
  lessonId: string;
  teacherId: string;
  halaqaId: string;
  title: string;
  subject: string;
  surahOrTopic: string;
  ayahFrom?: string;
  ayahTo?: string;
  objective?: string;
  studentNotes?: string;
  lessonDate: string;
  lessonStatus: LessonPrepStatus;
  requirementType: RequirementType;
  submissionType: SubmissionType;
  dueLabel?: string;
  createdAt: string;
}

export const SUBJECTS = ["القرآن", "التجويد", "الحفظ", "المراجعة", "السلوك والآداب"] as const;

export const REQUIREMENT_LABEL: Record<RequirementType, string> = {
  recitation: "تسميع",
  memorization: "حفظ",
  review: "مراجعة",
  reading: "قراءة",
  none: "بدون مطلوب",
};

export const SUBMISSION_LABEL: Record<SubmissionType, string> = {
  none: "بدون تسليم",
  audio: "تسجيل صوت",
  video: "تسجيل فيديو",
  audio_or_video: "صوت أو فيديو",
};

const KEY = "alashbal:lesson-prep";
const EVENT = "alashbal:lesson-prep-changed";
const EMPTY: LessonPrep[] = [];

function readAll(): LessonPrep[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LessonPrep[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Demo reset: clears ONLY the lesson-prep store. */
export function resetLessonPrep() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

function writeAll(list: LessonPrep[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Save (or replace by lessonId) a lesson prep. */
export function savePrep(input: Omit<LessonPrep, "lessonId" | "createdAt"> & { lessonId?: string }) {
  // Spread FIRST so an explicit `lessonId: undefined` (new prep) can't override
  // the generated id below.
  const { lessonId, ...rest } = input;
  const prep: LessonPrep = {
    ...rest,
    lessonId: lessonId ?? `prep-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const others = readAll().filter((p) => p.lessonId !== prep.lessonId);
  writeAll([prep, ...others]);
}

export function lessonPrepTitle(p: LessonPrep): string {
  if (p.title.trim()) return p.title.trim();
  const range = p.ayahFrom && p.ayahTo ? ` ${p.ayahFrom}-${p.ayahTo}` : "";
  return `${p.surahOrTopic}${range}`.trim() || "درس";
}

export function lessonPrepTaskTitle(p: LessonPrep): string {
  const range = p.ayahFrom && p.ayahTo ? ` من ${p.ayahFrom} إلى ${p.ayahTo}` : "";
  return `${REQUIREMENT_LABEL[p.requirementType]} ${p.surahOrTopic}${range}`.trim();
}

function sortPreps(list: LessonPrep[]): LessonPrep[] {
  return [...list].sort((a, b) => {
    if (a.lessonStatus !== b.lessonStatus) return a.lessonStatus === "today" ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function usePrepList(halaqaId?: string): LessonPrep[] {
  const cache = useRef<{ sig: string; value: LessonPrep[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): LessonPrep[] => {
    const filtered = halaqaId ? readAll().filter((p) => p.halaqaId === halaqaId) : readAll();
    const list = sortPreps(filtered);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [halaqaId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useAllPreps(): LessonPrep[] {
  return usePrepList();
}

export function usePrepsForHalaqa(halaqaId: string): LessonPrep[] {
  return usePrepList(halaqaId);
}

/** Today's lesson plan = the teacher's prep entries marked "today" for a halaqa.
 *  This is the single source for "درس اليوم" — NOT the student tasks. */
export function useTodayLessonPlan(halaqaId: string): LessonPrep[] {
  return usePrepList(halaqaId).filter((p) => p.lessonStatus === "today");
}
