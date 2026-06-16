"use client";

/*
  الأشبال — client-side demo activities store (Phase 01 · Task A5 → A5.1 → A5.1-R).
  PROTOTYPE ONLY: a teacher activates a TEMPORARY in-class activity that carries
  SEVERAL SAFE questions (no drag, no matching). It surfaces on the child's HOME
  (/child) for the same halaqa; the child answers per-question and the teacher
  sees each child's answers. Everything lives in localStorage — no backend, no
  mock-db writes. Older A5 / A5.1 data is migrated safely on read.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type ActivityType =
  | "quick_question"
  | "short_quiz"
  | "memorization_challenge"
  | "group_activity";

export type ActivityStatus = "active" | "closed";

/** SAFE question types only — drag & matching were removed in A5.1-R. */
export type QuestionType =
  | "single_choice"
  | "true_false"
  | "short_answer"
  | "task_acknowledgement"
  | "ordering";

export interface ActivityQuestion {
  questionId: string;
  type: QuestionType;
  prompt: string;
  required: boolean;
  options?: string[]; // single_choice
  correctAnswer?: string; // single_choice (option text) | true_false ("true"/"false")
  items?: string[]; // ordering
  correctOrder?: string[]; // ordering (optional)
}

export interface Activity {
  activityId: string;
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  title: string;
  type: ActivityType;
  description: string;
  durationMinutes?: number;
  questions: ActivityQuestion[];
  status: ActivityStatus;
  createdAt: string;
  activatedAt?: string;
  closedAt?: string;
  // Legacy (pre-A5.1) single-prompt fields — kept ONLY for migration on read.
  prompt?: string;
  options?: string[];
  correctAnswer?: string;
}

/** A child's per-question answer value (shape depends on the question type). */
export type QuestionValue =
  | string // single_choice | true_false ("true"/"false") | short_answer
  | string[] // ordering
  | { acknowledged: boolean; note?: string }; // task_acknowledgement

export interface QuestionAnswer {
  questionId: string;
  type: QuestionType;
  value: QuestionValue;
  isCorrect?: boolean; // undefined ⇒ not auto-correctable
}

export interface ActivityAnswer {
  activityId: string;
  childId: string;
  childName: string;
  childUserId: string;
  halaqaId: string;
  answers: QuestionAnswer[];
  submittedAt: string;
}

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  quick_question: "سؤال سريع",
  short_quiz: "اختبار قصير",
  memorization_challenge: "تحدي حفظ",
  group_activity: "نشاط جماعي",
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: "اختيار واحد",
  true_false: "صح / خطأ",
  short_answer: "إجابة قصيرة",
  task_acknowledgement: "مهمة تنفيذية",
  ordering: "ترتيب",
};

/** Stable unique id for a freshly-authored question (module scope = pure-safe). */
export function newQuestionId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* --------------------------------------------------------- grading & helpers */

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/** Auto-grade a question. Returns undefined when it is not auto-correctable. */
export function gradeQuestion(q: ActivityQuestion, value: QuestionValue): boolean | undefined {
  switch (q.type) {
    case "single_choice":
      return q.correctAnswer ? value === q.correctAnswer : undefined;
    case "true_false":
      return q.correctAnswer ? String(value) === q.correctAnswer : undefined;
    case "ordering":
      return q.correctOrder && Array.isArray(value)
        ? arraysEqual(value as string[], q.correctOrder)
        : undefined;
    default:
      return undefined; // short_answer, task_acknowledgement
  }
}

/** Whether the child has meaningfully answered a question (for required gating). */
export function isQuestionAnswered(q: ActivityQuestion, value: QuestionValue | undefined): boolean {
  if (value === undefined) return false;
  switch (q.type) {
    case "single_choice":
    case "true_false":
      return typeof value === "string" && value !== "";
    case "short_answer":
      return typeof value === "string" && value.trim() !== "";
    case "task_acknowledgement":
      return typeof value === "object" && !Array.isArray(value) && value.acknowledged === true;
    case "ordering":
      return Array.isArray(value) && value.length > 0;
    default:
      return false;
  }
}

/** The starting value the child UI uses for a question. */
export function defaultValue(q: ActivityQuestion): QuestionValue {
  switch (q.type) {
    case "task_acknowledgement":
      return { acknowledged: false };
    case "ordering":
      return [...(q.items ?? [])];
    default:
      return "";
  }
}

export interface AnswerStats {
  total: number;
  answered: number;
  correct: number;
  correctable: number;
}

/** Lightweight stats (NOT full scoring): answered count + correct/correctable. */
export function answerStats(activity: Activity, ans: ActivityAnswer): AnswerStats {
  const byId = new Map(activity.questions.map((q) => [q.questionId, q]));
  let answered = 0;
  let correct = 0;
  let correctable = 0;
  for (const a of ans.answers) {
    const q = byId.get(a.questionId);
    if (q && isQuestionAnswered(q, a.value)) answered += 1;
    if (a.isCorrect !== undefined) {
      correctable += 1;
      if (a.isCorrect) correct += 1;
    }
  }
  return { total: activity.questions.length, answered, correct, correctable };
}

/* ----------------------------------------------------------------- migration */

/**
 * Normalize a stored question into a SAFE shape:
 *  - A5.1 "matching" questions are downgraded to short_answer (drag removed).
 *  - matching-only fields (leftItems/rightItems/correctPairs) are dropped.
 *  - ordering keeps its items/correctOrder (now arrows-only).
 */
function normalizeQuestion(raw: ActivityQuestion): ActivityQuestion {
  const base = {
    questionId: raw.questionId || newQuestionId(),
    prompt: typeof raw.prompt === "string" ? raw.prompt : "",
    required: Boolean(raw.required),
  };
  switch (raw.type) {
    case "single_choice":
      return { ...base, type: "single_choice", options: raw.options ?? [], correctAnswer: raw.correctAnswer };
    case "true_false":
      return { ...base, type: "true_false", correctAnswer: raw.correctAnswer };
    case "ordering":
      return { ...base, type: "ordering", items: raw.items ?? [], correctOrder: raw.correctOrder };
    case "task_acknowledgement":
      return { ...base, type: "task_acknowledgement" };
    default:
      // short_answer + any removed type (e.g. legacy "matching")
      return { ...base, type: "short_answer" };
  }
}

/** Ensure any stored activity has a SAFE `questions[]` (migrate A5 / A5.1). */
function normalizeActivity(raw: Activity): Activity {
  if (Array.isArray(raw.questions) && raw.questions.length > 0) {
    return { ...raw, questions: raw.questions.map(normalizeQuestion) };
  }
  const hasOptions = Array.isArray(raw.options) && raw.options.length > 0;
  const legacy = normalizeQuestion({
    questionId: `${raw.activityId}-q1`,
    type: hasOptions ? "single_choice" : "short_answer",
    prompt: raw.prompt?.trim() || raw.title,
    required: false,
    options: hasOptions ? raw.options : undefined,
    correctAnswer: raw.correctAnswer,
  } as ActivityQuestion);
  return { ...raw, questions: [legacy] };
}

/**
 * Ensure a stored answer has a SAFE `answers[]`. A5 answers stored a single
 * `answer` string (no array) — without this guard, reading them crashes the
 * page (`for (const a of ans.answers)` on undefined). We coerce to an array and
 * drop malformed entries; unrecoverable A5 single-answers become an empty set.
 */
function normalizeAnswer(raw: ActivityAnswer): ActivityAnswer {
  const answers = Array.isArray(raw.answers)
    ? raw.answers.filter((a) => a && typeof a === "object" && typeof a.questionId === "string")
    : [];
  return { ...raw, answers };
}

/* ----------------------------------------------------------------- activities */

const KEY = "alashbal:activities";
const EVENT = "alashbal:activities-changed";
const EMPTY: Activity[] = [];

function readAll(): Activity[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return (parsed as Activity[])
      .map((a) => {
        try {
          return normalizeActivity(a);
        } catch {
          return null;
        }
      })
      .filter((a): a is Activity => a !== null);
  } catch {
    // Corrupt data must never crash the page.
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

/** Create and activate a multi-question activity. One active per halaqa. */
export function createActivity(input: {
  teacherId: string;
  teacherName: string;
  halaqaId: string;
  title: string;
  type: ActivityType;
  description: string;
  durationMinutes?: number;
  questions: ActivityQuestion[];
}): Activity {
  const now = new Date().toISOString();
  const activity: Activity = {
    activityId: `act-${Date.now()}`,
    status: "active",
    createdAt: now,
    activatedAt: now,
    ...input,
  };
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

/** Wipe ONLY the demo activities + activity answers (nothing else). */
export function resetActivitiesData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(ANSWERS_KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
  window.dispatchEvent(new CustomEvent(ANSWERS_EVENT));
}

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
    if (!raw) return EMPTY_ANSWERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ANSWERS;
    return (parsed as ActivityAnswer[])
      .map((a) => {
        try {
          return normalizeAnswer(a);
        } catch {
          return null;
        }
      })
      .filter((a): a is ActivityAnswer => a !== null);
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

/** Record (or replace) a child's full set of answers to an activity. */
export function submitAnswer(input: Omit<ActivityAnswer, "submittedAt">) {
  const rest = readAnswers().filter(
    (a) => !(a.activityId === input.activityId && a.childId === input.childId),
  );
  writeAnswers([{ ...input, submittedAt: new Date().toISOString() }, ...rest]);
}

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
