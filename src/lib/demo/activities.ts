"use client";

/*
  الأشبال — client-side demo activities store (Phase 01 · Task A5).
  PROTOTYPE ONLY: a teacher activates a temporary in-class activity/quiz that
  surfaces on the child's HOME (/child) for the same halaqa, and children submit
  mock answers. Everything lives in localStorage — no backend, no mock-db writes.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type ActivityType =
  | "quick_question"
  | "short_quiz"
  | "memorization_challenge"
  | "group_activity";

export type ActivityStatus = "active" | "closed";

export interface Activity {
  activityId: string;
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  title: string;
  type: ActivityType;
  description: string;
  prompt: string;
  options: string[]; // empty ⇒ free-text answer
  correctAnswer?: string; // optional in the demo
  durationMinutes?: number; // optional
  status: ActivityStatus;
  createdAt: string;
  activatedAt?: string;
  closedAt?: string;
}

export interface ActivityAnswer {
  activityId: string;
  childId: string;
  childName: string;
  childUserId: string;
  halaqaId: string;
  answer: string;
  submittedAt: string;
}

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  quick_question: "سؤال سريع",
  short_quiz: "اختبار قصير",
  memorization_challenge: "تحدي حفظ",
  group_activity: "نشاط جماعي",
};

/* ----------------------------------------------------------------- activities */

const KEY = "alashbal:activities";
const EVENT = "alashbal:activities-changed";
const EMPTY: Activity[] = [];

function readAll(): Activity[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Activity[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: Activity[]) {
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

/** Create and activate an activity. Only one activity stays active per halaqa. */
export function createActivity(input: {
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  title: string;
  type: ActivityType;
  description: string;
  prompt: string;
  options: string[];
  correctAnswer?: string;
  durationMinutes?: number;
}): Activity {
  const now = new Date().toISOString();
  const activity: Activity = {
    activityId: `act-${Date.now()}`,
    status: "active",
    createdAt: now,
    activatedAt: now,
    ...input,
  };
  // Close any other active activity in the same halaqa first.
  const others = readAll().map((a) =>
    a.halaqaId === input.halaqaId && a.status === "active"
      ? { ...a, status: "closed" as const, closedAt: now }
      : a,
  );
  writeAll([activity, ...others]);
  return activity;
}

/** Re-activate a (closed) activity; closes any other active one in its halaqa. */
export function activateActivity(activityId: string) {
  const now = new Date().toISOString();
  const list = readAll();
  const target = list.find((a) => a.activityId === activityId);
  if (!target) return;
  writeAll(
    list.map((a) => {
      if (a.activityId === activityId) {
        return { ...a, status: "active" as const, activatedAt: now, closedAt: undefined };
      }
      if (a.halaqaId === target.halaqaId && a.status === "active") {
        return { ...a, status: "closed" as const, closedAt: now };
      }
      return a;
    }),
  );
}

/** Close an active activity (it becomes "منتهٍ"). */
export function closeActivity(activityId: string) {
  const now = new Date().toISOString();
  writeAll(
    readAll().map((a) =>
      a.activityId === activityId ? { ...a, status: "closed" as const, closedAt: now } : a,
    ),
  );
}

/** The single active activity for a halaqa (what the child sees), or null. */
export function useActiveActivityForHalaqa(halaqaId: string): Activity | null {
  const cache = useRef<{ sig: string; value: Activity | null }>({ sig: "∅", value: null });
  const getSnapshot = useCallback((): Activity | null => {
    const found =
      readAll().find((a) => a.halaqaId === halaqaId && a.status === "active") ?? null;
    const sig = JSON.stringify(found);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: found };
    return found;
  }, [halaqaId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** All activities created by a teacher, newest first (active + closed). */
export function useTeacherActivities(teacherId: string): Activity[] {
  const cache = useRef<{ sig: string; value: Activity[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): Activity[] => {
    const list = readAll()
      .filter((a) => a.teacherId === teacherId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [teacherId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/* -------------------------------------------------------------------- answers */

const ANSWERS_KEY = "alashbal:activity-answers";
const ANSWERS_EVENT = "alashbal:activity-answers-changed";
const EMPTY_ANSWERS: ActivityAnswer[] = [];

function readAnswers(): ActivityAnswer[] {
  if (typeof window === "undefined") return EMPTY_ANSWERS;
  try {
    const raw = window.localStorage.getItem(ANSWERS_KEY);
    return raw ? (JSON.parse(raw) as ActivityAnswer[]) : EMPTY_ANSWERS;
  } catch {
    return EMPTY_ANSWERS;
  }
}

function writeAnswers(list: ActivityAnswer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(ANSWERS_EVENT));
}

function subscribeAnswers(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ANSWERS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ANSWERS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Record (or replace) a child's answer to an activity. */
export function submitAnswer(input: Omit<ActivityAnswer, "submittedAt">) {
  const rest = readAnswers().filter(
    (a) => !(a.activityId === input.activityId && a.childId === input.childId),
  );
  writeAnswers([{ ...input, submittedAt: new Date().toISOString() }, ...rest]);
}

/** All answers for an activity (teacher view — caller scopes to its halaqa). */
export function useAnswersForActivity(activityId: string | undefined): ActivityAnswer[] {
  const cache = useRef<{ sig: string; value: ActivityAnswer[] }>({ sig: "∅", value: EMPTY_ANSWERS });
  const getSnapshot = useCallback((): ActivityAnswer[] => {
    const list = activityId
      ? readAnswers().filter((a) => a.activityId === activityId)
      : EMPTY_ANSWERS;
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [activityId]);
  return useSyncExternalStore(subscribeAnswers, getSnapshot, () => EMPTY_ANSWERS);
}

/** A single child's own answer to an activity (child confirmation only). */
export function useChildAnswer(
  activityId: string | undefined,
  childId: string,
): ActivityAnswer | null {
  const cache = useRef<{ sig: string; value: ActivityAnswer | null }>({ sig: "∅", value: null });
  const getSnapshot = useCallback((): ActivityAnswer | null => {
    const found = activityId
      ? readAnswers().find((a) => a.activityId === activityId && a.childId === childId) ?? null
      : null;
    const sig = JSON.stringify(found);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: found };
    return found;
  }, [activityId, childId]);
  return useSyncExternalStore(subscribeAnswers, getSnapshot, () => null);
}
