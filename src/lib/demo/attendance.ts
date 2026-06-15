"use client";

/*
  الأشبال — client-side demo attendance gate (Phase 01 · Task 7.1).
  PROTOTYPE ONLY: state lives in localStorage so the child page and the teacher
  page can talk within the same browser. Nothing is saved to a backend/db.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type AttendanceStatus = "present" | "late" | "absent" | "not_joined";
export type GateStatus = "idle" | "open" | "closed";

export interface AttendanceEntry {
  status: AttendanceStatus;
  joinedAt?: string;
  manual?: boolean;
}

export interface AttendanceGate {
  status: GateStatus;
  openedAt?: string;
  closedAt?: string;
  graceMinutes: number;
  meetUrl?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface AttendanceState {
  gate: AttendanceGate;
  entries: Record<string, AttendanceEntry>;
}

export const GRACE_MINUTES = 10;
const EVENT = "alashbal:attendance-changed";
const keyFor = (lessonId: string) => `alashbal:attendance:${lessonId}`;

// Stable empty reference (used for SSR + empty store, keeps snapshots referentially stable).
const EMPTY: AttendanceState = {
  gate: { status: "idle", graceMinutes: GRACE_MINUTES },
  entries: {},
};

function readState(lessonId: string): AttendanceState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(keyFor(lessonId));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as AttendanceState) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeState(lessonId: string, state: AttendanceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(lessonId), JSON.stringify(state));
  // notify listeners in the same tab; the "storage" event covers other tabs.
  window.dispatchEvent(new CustomEvent(EVENT, { detail: lessonId }));
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

export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  notJoined: number;
  total: number;
  scorePercent: number;
}

/** Demo score: present = 100%, late = 70%, absent/not-joined = 0% (averaged). */
export function summarize(state: AttendanceState, childIds: string[]): AttendanceSummary {
  let present = 0;
  let late = 0;
  let absent = 0;
  let notJoined = 0;
  for (const id of childIds) {
    const status = state.entries[id]?.status ?? "not_joined";
    if (status === "present") present++;
    else if (status === "late") late++;
    else if (status === "absent") absent++;
    else notJoined++;
  }
  const total = childIds.length;
  const scorePercent = total === 0 ? 0 : Math.round((present * 100 + late * 70) / total);
  return { present, late, absent, notJoined, total, scorePercent };
}

export function useAttendance(lessonId: string, childIds: string[]) {
  // Cache the parsed snapshot by raw string so getSnapshot stays referentially stable.
  const cache = useRef<{ raw: string | null; value: AttendanceState }>({ raw: null, value: EMPTY });

  const getSnapshot = useCallback((): AttendanceState => {
    if (typeof window === "undefined") return EMPTY;
    const raw = window.localStorage.getItem(keyFor(lessonId));
    if (raw === null) return EMPTY;
    if (cache.current.raw === raw) return cache.current.value;
    let value: AttendanceState;
    try {
      value = { ...EMPTY, ...(JSON.parse(raw) as AttendanceState) };
    } catch {
      return EMPTY;
    }
    cache.current = { raw, value };
    return value;
  }, [lessonId]);

  const getServerSnapshot = useCallback((): AttendanceState => EMPTY, []);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const openGate = useCallback(
    (opts?: { meetUrl?: string; teacherId?: string; teacherName?: string }) => {
      const entries: Record<string, AttendanceEntry> = {};
      for (const id of childIds) entries[id] = { status: "not_joined" };
      writeState(lessonId, {
        gate: {
          status: "open",
          openedAt: new Date().toISOString(),
          graceMinutes: GRACE_MINUTES,
          meetUrl: opts?.meetUrl,
          teacherId: opts?.teacherId,
          teacherName: opts?.teacherName,
        },
        entries,
      });
    },
    [childIds, lessonId],
  );

  const closeGate = useCallback(() => {
    const prev = readState(lessonId);
    const entries: Record<string, AttendanceEntry> = { ...prev.entries };
    for (const id of childIds) {
      const current = entries[id]?.status;
      if (!current || current === "not_joined") entries[id] = { status: "absent" };
    }
    writeState(lessonId, {
      gate: { ...prev.gate, status: "closed", closedAt: new Date().toISOString() },
      entries,
    });
  }, [childIds, lessonId]);

  /** Called by the child. Returns the resulting status, or ok:false if the gate isn't open. */
  const recordJoin = useCallback(
    (childId: string): { ok: boolean; status?: AttendanceStatus } => {
      const prev = readState(lessonId);
      if (prev.gate.status !== "open" || !prev.gate.openedAt) return { ok: false };
      const minutesLate = (Date.now() - new Date(prev.gate.openedAt).getTime()) / 60000;
      const status: AttendanceStatus = minutesLate <= prev.gate.graceMinutes ? "present" : "late";
      writeState(lessonId, {
        ...prev,
        entries: { ...prev.entries, [childId]: { status, joinedAt: new Date().toISOString(), manual: false } },
      });
      return { ok: true, status };
    },
    [lessonId],
  );

  /** Teacher manual override. */
  const setManual = useCallback(
    (childId: string, status: AttendanceStatus) => {
      const prev = readState(lessonId);
      writeState(lessonId, {
        ...prev,
        entries: { ...prev.entries, [childId]: { ...prev.entries[childId], status, manual: true } },
      });
    },
    [lessonId],
  );

  return { state, openGate, closeGate, recordJoin, setManual };
}

export interface OpenGateInfo {
  lessonId: string;
  meetUrl?: string;
  teacherName?: string;
  openedAt?: string;
}

const KEY_PREFIX = "alashbal:attendance:";

function findOpenGate(): OpenGateInfo | null {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX)) continue;
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "") as AttendanceState;
      if (state?.gate?.status === "open") {
        return {
          lessonId: key.slice(KEY_PREFIX.length),
          meetUrl: state.gate.meetUrl,
          teacherName: state.gate.teacherName,
          openedAt: state.gate.openedAt,
        };
      }
    } catch {
      // ignore malformed entries
    }
  }
  return null;
}

/**
 * Returns the first currently-open gate in this browser (any lesson), or null.
 * Used by the guest entry to follow whichever gate the teacher opened — without
 * touching any child data.
 */
export function useOpenGate(): OpenGateInfo | null {
  const cache = useRef<{ sig: string; value: OpenGateInfo | null }>({ sig: "∅", value: null });
  const getSnapshot = useCallback((): OpenGateInfo | null => {
    const found = findOpenGate();
    const sig = found ? JSON.stringify(found) : "";
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: found };
    return found;
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
