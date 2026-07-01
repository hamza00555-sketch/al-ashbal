"use client";

/*
  الأشبال — demo recitation submissions workflow (Phase 01 · Task A4).
  Tracks the lifecycle of a recorded recitation across child → parent → teacher.
  localStorage only (the Blob itself lives in IndexedDB, see recordings.ts).

  Keyed by `${taskId}::${childId}` — one submission PER CHILD per task, so two
  siblings on the same shared family device can submit the same assignment
  without overwriting or blocking each other. (Legacy taskId-only keys are
  migrated on read.)
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type SubmissionState = "pending_parent" | "pending_teacher" | "accepted" | "rerecord";

export interface Submission {
  id: string;
  taskId: string;
  childId: string;
  childName: string;
  childUserId: string;
  parentUserId: string;
  teacherId?: string;
  title: string;
  recordingId: string;
  recordingType: "audio" | "video";
  state: SubmissionState;
  note?: string;
  createdAt: string;
  /** Optional link to a learning material + saved lesson (Phase C/D). Copied
   *  from the assignment so teacher acceptance can credit the right material.
   *  All optional → old submissions keep working. */
  materialId?: string;
  lessonId?: string;
  points?: number;
  materialName?: string;
  lessonTitle?: string;
}

type SubmissionMap = Record<string, Submission>; // keyed by `${taskId}::${childId}`

const KEY = "alashbal:submissions";
const EVENT = "alashbal:submissions-changed";
const EMPTY: SubmissionMap = {};

/** Composite store key: one submission per child per task (sibling-safe). */
export function submissionKey(taskId: string, childId: string): string {
  return `${taskId}::${childId}`;
}

function readAll(): SubmissionMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    const map = parsed as SubmissionMap;
    // Migrate legacy entries keyed by bare taskId to the composite key.
    let migrated = false;
    const next: SubmissionMap = {};
    for (const [key, sub] of Object.entries(map)) {
      if (key.includes("::")) {
        next[key] = sub;
      } else {
        next[submissionKey(sub.taskId, sub.childId)] = sub;
        migrated = true;
      }
    }
    if (migrated) window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return EMPTY;
  }
}

/** Demo reset: clears ONLY the recitation submissions workflow store. */
export function resetSubmissions() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

function writeAll(map: SubmissionMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
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

/** The one submission for THIS child on THIS task (or undefined). */
export function getSubmissionFor(taskId: string, childId: string): Submission | undefined {
  return readAll()[submissionKey(taskId, childId)];
}

/** Create or replace the submission for a (task, child) pair. */
export function upsertSubmission(sub: Submission) {
  const map = readAll();
  const key = submissionKey(sub.taskId, sub.childId);
  writeAll({ ...map, [key]: { ...map[key], ...sub } });
}

/** Patch the state (and optional note) of an existing (task, child) submission. */
export function updateSubmission(taskId: string, childId: string, patch: Partial<Submission>) {
  const map = readAll();
  const key = submissionKey(taskId, childId);
  const current = map[key];
  if (!current) return;
  writeAll({ ...map, [key]: { ...current, ...patch } });
}

export function useSubmissions(): SubmissionMap {
  const cache = useRef<{ sig: string; value: SubmissionMap }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): SubmissionMap => {
    const map = readAll();
    const sig = JSON.stringify(map);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: map };
    return map;
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
