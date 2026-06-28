"use client";

/*
  الأشبال — DEMO teacher-generated invitations (local only, no backend).

  A teacher generates a FAMILY invitation (parent registers + adds up to N
  children) or a STUDENT invitation (one student self-registers). The code/link
  controls which registration path /join shows. No halaqa code, no multi-halaqa.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type DemoInvitationType = "family" | "student";
export type DemoInvitationStatus = "active" | "expired" | "revoked";

export interface DemoInvitation {
  id: string;
  type: DemoInvitationType;
  code: string;
  label?: string;
  createdByTeacherId: string;
  createdAt: string;
  expiresAt?: string;
  revokedAt?: string;
  maxChildren?: number;
  maxParents?: number;
  usedChildrenCount: number;
  usedParentsCount: number;
  /** Set when the invitation has been fully used (student single-use / family full). */
  usedAt?: string;
}

const KEY = "alashbal:demo-invitations";
const EVENT = "alashbal:demo-invitations-changed";
const EMPTY: DemoInvitation[] = [];

function readAll(): DemoInvitation[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as DemoInvitation[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}
function writeAll(list: DemoInvitation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}
function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
function rand4(): string {
  return Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "0");
}

// ---- create / read ---------------------------------------------------------

export function createInvitation(
  teacherId: string,
  input: { type: DemoInvitationType; label?: string; maxChildren?: number; maxParents?: number; expiresDays?: number },
): DemoInvitation {
  const days = input.expiresDays ?? 7;
  const inv: DemoInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: input.type,
    code: `${input.type === "family" ? "FAM" : "STD"}-${rand4()}`,
    label: input.label?.trim() || undefined,
    createdByTeacherId: teacherId,
    createdAt: new Date().toISOString(),
    expiresAt: days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : new Date(Date.now() - 1000).toISOString(),
    maxChildren: input.type === "family" ? (input.maxChildren ?? 1) : 1,
    maxParents: input.type === "family" ? (input.maxParents ?? 1) : 0,
    usedChildrenCount: 0,
    usedParentsCount: 0,
  };
  writeAll([inv, ...readAll()]);
  return inv;
}

export function getInvitations(): DemoInvitation[] {
  return readAll();
}

export function findInvitationByCode(code: string): DemoInvitation | null {
  const wanted = normalize(code);
  if (!wanted) return null;
  return readAll().find((i) => normalize(i.code) === wanted) ?? null;
}

export function statusOf(inv: DemoInvitation): DemoInvitationStatus {
  if (inv.revokedAt) return "revoked";
  if (inv.expiresAt && Date.parse(inv.expiresAt) < Date.now()) return "expired";
  return "active";
}

export function revokeInvitation(id: string) {
  const list = readAll();
  const idx = list.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const next = [...list];
  next[idx] = { ...next[idx], revokedAt: new Date().toISOString() };
  writeAll(next);
}

/** Increment usage counters for an invitation (after a successful registration). */
export function recordInvitationUse(id: string, addChildren = 0, addParents = 0) {
  const list = readAll();
  const idx = list.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const cur = list[idx];
  const usedChildrenCount = cur.usedChildrenCount + addChildren;
  const next = [...list];
  next[idx] = {
    ...cur,
    usedChildrenCount,
    usedParentsCount: cur.usedParentsCount + addParents,
    // Stamp usedAt once the invitation can take no more children (single-use student / full family).
    usedAt: cur.usedAt ?? (usedChildrenCount >= (cur.maxChildren ?? 1) ? new Date().toISOString() : undefined),
  };
  writeAll(next);
}

/** How many more children this invitation may still register (0 if none). */
export function remainingChildren(inv: DemoInvitation): number {
  return Math.max(0, (inv.maxChildren ?? 1) - inv.usedChildrenCount);
}

/** Validate a code for registration; returns an Arabic error string or null. */
export function validateForUse(inv: DemoInvitation | null): string | null {
  if (!inv) return "كود الدعوة غير صحيح";
  const st = statusOf(inv);
  if (st === "revoked") return "تم إيقاف هذه الدعوة";
  if (st === "expired") return "انتهت صلاحية الدعوة";
  if (remainingChildren(inv) <= 0) {
    return inv.type === "student" ? "تم استخدام هذه الدعوة" : "تم استخدام عدد الأطفال المسموح لهذه الدعوة";
  }
  return null;
}

// ---- reactive hook ---------------------------------------------------------

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Reactively resolve a code to an invitation (or an Arabic error). SSR-safe:
 *  the server snapshot is empty so /join can be a dynamic route without a
 *  hydration mismatch. An empty code yields no invitation and no error. */
type ResolvedInvitation = { inv: DemoInvitation | null; error: string | null };
const EMPTY_RESOLVED: ResolvedInvitation = { inv: null, error: null };

export function useInvitationByCode(code: string): ResolvedInvitation {
  const cache = useRef<{ sig: string; value: ResolvedInvitation }>({ sig: "∅", value: EMPTY_RESOLVED });
  const getSnapshot = useCallback((): ResolvedInvitation => {
    const trimmed = code.trim();
    if (!trimmed) {
      if (cache.current.sig !== "∅") cache.current = { sig: "∅", value: EMPTY_RESOLVED };
      return cache.current.value;
    }
    const found = findInvitationByCode(trimmed);
    const error = validateForUse(found);
    const result: ResolvedInvitation = error ? { inv: null, error } : { inv: found, error: null };
    const sig = JSON.stringify({ c: trimmed, r: result });
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: result };
    return result;
  }, [code]);
  const getServer = useCallback(() => EMPTY_RESOLVED, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServer);
}

export function useInvitationsForTeacher(teacherId: string): DemoInvitation[] {
  const cache = useRef<{ sig: string; value: DemoInvitation[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): DemoInvitation[] => {
    const list = readAll().filter((i) => i.createdByTeacherId === teacherId);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [teacherId]);
  const getServer = useCallback((): DemoInvitation[] => EMPTY, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServer);
}
