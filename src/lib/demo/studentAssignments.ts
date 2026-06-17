"use client";

/*
  الأشبال — client-side demo "student assignments" store.
  INDEPENDENT from lesson prep: the teacher can add student tasks at any time
  without preparing a lesson, and saving/editing a lesson prep never touches
  these. Each add is its OWN card (never replaces previous ones).
  localStorage only (the recording Blob lives in IndexedDB; the submission
  lifecycle reuses the existing submissions/reviews stores via the task id).
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type AssignmentType = "recitation" | "memorization" | "review" | "reading" | "confirm";
export type AssignmentSubmissionType = "none" | "audio" | "video" | "audio_or_video";
export type AssignmentStatus = "active" | "closed" | "archived";

export interface StudentAssignment {
  id: string;
  halaqaId: string;
  teacherId: string;
  title: string;
  description?: string;
  type: AssignmentType;
  submissionType: AssignmentSubmissionType;
  dueLabel?: string;
  status: AssignmentStatus;
  createdAt: string;
}

export const ASSIGNMENT_TYPE_LABEL: Record<AssignmentType, string> = {
  recitation: "تسميع",
  memorization: "حفظ",
  review: "مراجعة",
  reading: "قراءة",
  confirm: "تأكيد إنجاز",
};

export const ASSIGNMENT_SUBMISSION_LABEL: Record<AssignmentSubmissionType, string> = {
  none: "بدون تسليم",
  audio: "تسجيل صوت",
  video: "تسجيل فيديو",
  audio_or_video: "صوت أو فيديو",
};

const KEY = "alashbal:student-assignments";
const EVENT = "alashbal:student-assignments-changed";
const EMPTY: StudentAssignment[] = [];

function readAll(): StudentAssignment[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StudentAssignment[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: StudentAssignment[]) {
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

/** Add a NEW assignment (always its own card — never replaces existing ones). */
export function addAssignment(
  input: Omit<StudentAssignment, "id" | "createdAt" | "status">,
): StudentAssignment {
  const assignment: StudentAssignment = {
    ...input,
    id: `asg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "active",
  };
  writeAll([assignment, ...readAll()]);
  return assignment;
}

/** Close / archive / re-activate an assignment (no deletion). */
export function setAssignmentStatus(id: string, status: AssignmentStatus) {
  writeAll(readAll().map((a) => (a.id === id ? { ...a, status } : a)));
}

/** Demo reset: clears ONLY the student-assignments store. */
export function resetStudentAssignments() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

function sortAssignments(list: StudentAssignment[]): StudentAssignment[] {
  // active first, then newest.
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function useAssignmentsForHalaqa(halaqaId?: string): StudentAssignment[] {
  const cache = useRef<{ sig: string; value: StudentAssignment[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): StudentAssignment[] => {
    const filtered = halaqaId ? readAll().filter((a) => a.halaqaId === halaqaId) : readAll();
    const list = sortAssignments(filtered);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [halaqaId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
