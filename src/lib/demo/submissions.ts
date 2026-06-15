"use client";

/*
  الأشبال — demo recitation submissions workflow (Phase 01 · Task A4).
  Tracks the lifecycle of a recorded recitation across child → parent → teacher.
  localStorage only (the Blob itself lives in IndexedDB, see recordings.ts).
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
}

type SubmissionMap = Record<string, Submission>; // keyed by taskId

const KEY = "alashbal:submissions";
const EVENT = "alashbal:submissions-changed";
const EMPTY: SubmissionMap = {};

function readAll(): SubmissionMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SubmissionMap) : EMPTY;
  } catch {
    return EMPTY;
  }
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

/** Create or replace the submission for a task. */
export function upsertSubmission(sub: Submission) {
  const map = readAll();
  writeAll({ ...map, [sub.taskId]: { ...map[sub.taskId], ...sub } });
}

/** Patch the state (and optional note) of an existing submission. */
export function updateSubmission(taskId: string, patch: Partial<Submission>) {
  const map = readAll();
  const current = map[taskId];
  if (!current) return;
  writeAll({ ...map, [taskId]: { ...current, ...patch } });
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
