"use client";

/*
  الأشبال — DEMO halaqa enrollment + invite codes (local only, no backend).

  Models the REAL enrollment flow as a localStorage demo:
    teacher has a halaqa code → parent enters the code + picks a demo child →
    the child is enrolled into that halaqa → the teacher sees the child.

  Two own keys, never touching other demo stores:
    - alashbal:demo-halaqa-invite       (per-halaqa invite code overrides)
    - alashbal:demo-halaqa-enrollments  (explicit parent↔child↔halaqa records)

  Empty-first: NO child is ever auto-enrolled. A fresh device has zero
  enrollments. Every halaqa still has a (deterministic) default code so the
  teacher always has something to share — but a code alone enrolls nobody.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";
import { halaqas } from "@/lib/data/halaqas";

// ---- types -----------------------------------------------------------------

export interface DemoHalaqaEnrollment {
  id: string;
  halaqaId: string;
  halaqaCode: string;
  parentId: string;
  childId: string;
  linkedAt: string;
  status: "active";
}

export interface HalaqaMatch {
  halaqaId: string;
  code: string;
  name: string;
  teacherId?: string;
}

// ---- invite codes ----------------------------------------------------------

const INVITE_KEY = "alashbal:demo-halaqa-invite";
const INVITE_EVENT = "alashbal:demo-halaqa-invite-changed";

/** Deterministic, readable default code for a halaqa (stable across reloads). */
export function defaultHalaqaCode(halaqaId: string): string {
  let hash = 0;
  const salt = `alashbal:${halaqaId}`;
  for (let i = 0; i < salt.length; i++) hash = (hash * 31 + salt.charCodeAt(i)) >>> 0;
  const body = hash.toString(36).toUpperCase().padStart(5, "0").slice(0, 5);
  return `HLQ-${body}`;
}

/** Normalize a code for comparison (trim, upper, collapse spaces). */
function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

type InviteMap = Record<string, string>; // halaqaId -> code

function readInvites(): InviteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(INVITE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as InviteMap) : {};
  } catch {
    return {};
  }
}

function writeInvites(map: InviteMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVITE_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(INVITE_EVENT));
}

/** Current code for a halaqa (override if regenerated, else deterministic default). */
export function getHalaqaCode(halaqaId: string): string {
  return readInvites()[halaqaId] ?? defaultHalaqaCode(halaqaId);
}

/** Regenerate a fresh random code for a halaqa (teacher action). */
export function regenerateHalaqaCode(halaqaId: string): string {
  const rnd = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5).padEnd(5, "0");
  const code = `HLQ-${rnd}`;
  writeInvites({ ...readInvites(), [halaqaId]: code });
  return code;
}

/** Find a halaqa whose current code matches the entered text, or null. */
export function findHalaqaByCode(input: string): HalaqaMatch | null {
  const wanted = normalizeCode(input);
  if (!wanted) return null;
  for (const h of halaqas) {
    if (normalizeCode(getHalaqaCode(h.id)) === wanted) {
      return { halaqaId: h.id, code: getHalaqaCode(h.id), name: h.name, teacherId: h.teacherIds[0] };
    }
  }
  return null;
}

// ---- enrollments -----------------------------------------------------------

const ENROLL_KEY = "alashbal:demo-halaqa-enrollments";
const ENROLL_EVENT = "alashbal:demo-halaqa-enrollments-changed";
const EMPTY: DemoHalaqaEnrollment[] = [];

function readEnrollments(): DemoHalaqaEnrollment[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(ENROLL_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoHalaqaEnrollment[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeEnrollments(list: DemoHalaqaEnrollment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENROLL_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(ENROLL_EVENT));
}

/**
 * Enroll a child into a halaqa for a parent. De-duped by (parentId, childId):
 * re-linking updates the halaqa instead of stacking. Never auto-called.
 */
export function addEnrollment(input: {
  halaqaId: string;
  halaqaCode: string;
  parentId: string;
  childId: string;
}): DemoHalaqaEnrollment {
  const list = readEnrollments();
  const existingIdx = list.findIndex((e) => e.parentId === input.parentId && e.childId === input.childId);
  const record: DemoHalaqaEnrollment = {
    id: existingIdx >= 0 ? list[existingIdx].id : `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    halaqaId: input.halaqaId,
    halaqaCode: input.halaqaCode,
    parentId: input.parentId,
    childId: input.childId,
    linkedAt: existingIdx >= 0 ? list[existingIdx].linkedAt : new Date().toISOString(),
    status: "active",
  };
  if (existingIdx >= 0) {
    const next = [...list];
    next[existingIdx] = record;
    writeEnrollments(next);
  } else {
    writeEnrollments([...list, record]);
  }
  return record;
}

/** Remove the enrollment (does NOT delete the child profile or any child data). */
export function removeEnrollment(parentId: string, childId: string) {
  writeEnrollments(readEnrollments().filter((e) => !(e.parentId === parentId && e.childId === childId)));
}

export function getEnrollmentForChild(childId: string): DemoHalaqaEnrollment | null {
  return readEnrollments().find((e) => e.childId === childId) ?? null;
}

export function getEnrolledChildIdsForParent(parentId: string): string[] {
  return readEnrollments().filter((e) => e.parentId === parentId).map((e) => e.childId);
}

export function getEnrolledChildIdsForHalaqa(halaqaId: string): string[] {
  return readEnrollments().filter((e) => e.halaqaId === halaqaId).map((e) => e.childId);
}

/** Alias: children (ids) enrolled in a halaqa — the teacher's roster source. */
export function getEnrolledChildrenForHalaqa(halaqaId: string): string[] {
  return getEnrolledChildIdsForHalaqa(halaqaId);
}

// ---- active-halaqa resolution ----------------------------------------------
// One rule for the whole app: a child's ACTIVE halaqa is their local active
// enrollment when it exists. The seed identity is only a fallback so the
// child's OWN demo page can still open — never for parent/teacher visibility.

/** The child's active enrollment record (local source of truth), or null. */
export function getActiveDemoEnrollmentForChild(childId: string): DemoHalaqaEnrollment | null {
  return readEnrollments().find((e) => e.childId === childId && e.status === "active") ?? null;
}

/** The parent's active enrollments (children they enrolled). */
export function getActiveDemoEnrollmentsForParent(parentId: string): DemoHalaqaEnrollment[] {
  return readEnrollments().filter((e) => e.parentId === parentId && e.status === "active");
}

/**
 * The child's ACTIVE halaqa id: the enrolled halaqa if any, else the seed
 * fallback (so the demo child page can still open). Returns undefined only when
 * there is no enrollment AND no fallback was provided.
 */
export function getChildActiveHalaqaId(childId: string, seedFallback?: string): string | undefined {
  return getActiveDemoEnrollmentForChild(childId)?.halaqaId ?? seedFallback;
}

// ---- reactive hooks --------------------------------------------------------

function subscribeInvite(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(INVITE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(INVITE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function subscribeEnroll(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ENROLL_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(ENROLL_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Reactive current code for a halaqa. */
export function useHalaqaCode(halaqaId: string): string {
  const getSnapshot = useCallback(() => getHalaqaCode(halaqaId), [halaqaId]);
  const getServer = useCallback(() => defaultHalaqaCode(halaqaId), [halaqaId]);
  return useSyncExternalStore(subscribeInvite, getSnapshot, getServer);
}

function useEnrolledIds(getIds: () => string[]): string[] {
  const cache = useRef<{ sig: string; value: string[] }>({ sig: "∅", value: EMPTY as unknown as string[] });
  const getSnapshot = useCallback((): string[] => {
    const ids = getIds();
    const sig = JSON.stringify(ids);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: ids };
    return ids;
  }, [getIds]);
  const getServer = useCallback((): string[] => EMPTY as unknown as string[], []);
  return useSyncExternalStore(subscribeEnroll, getSnapshot, getServer);
}

/** Reactive childIds enrolled by a parent. */
export function useEnrolledChildIdsForParent(parentId: string): string[] {
  const getIds = useCallback(() => getEnrolledChildIdsForParent(parentId), [parentId]);
  return useEnrolledIds(getIds);
}

/** Reactive childIds enrolled in a halaqa (teacher view). */
export function useEnrolledChildIdsForHalaqa(halaqaId: string): string[] {
  const getIds = useCallback(() => getEnrolledChildIdsForHalaqa(halaqaId), [halaqaId]);
  return useEnrolledIds(getIds);
}

/**
 * Reactive ACTIVE halaqa id for a child: the enrolled halaqa when present, else
 * the seed fallback. Use this anywhere the child's own content depends on their
 * halaqa (today lesson, assignments, prep) so enrollment is the source of truth.
 */
export function useChildActiveHalaqaId(childId: string, seedFallback: string): string {
  const cache = useRef<{ sig: string; value: string }>({ sig: "∅", value: seedFallback });
  const getSnapshot = useCallback((): string => {
    const value = getChildActiveHalaqaId(childId, seedFallback) ?? seedFallback;
    if (value === cache.current.value && cache.current.sig !== "∅") return cache.current.value;
    cache.current = { sig: value, value };
    return value;
  }, [childId, seedFallback]);
  const getServer = useCallback((): string => seedFallback, [seedFallback]);
  return useSyncExternalStore(subscribeEnroll, getSnapshot, getServer);
}
