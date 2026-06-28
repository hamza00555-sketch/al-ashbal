"use client";

/*
  الأشبال — DEMO role-based onboarding + parent↔child linking (local only).

  Product model (NO halaqa code, NO multi-halaqa):
    - A student self-registers → gets a "parent-link code" to give to a parent.
    - A parent registers and either creates a child (gets a "child-access code"
      to give to the child) or links a self-registered child by its code.
    - The link relationship is Parent ↔ Child (not via a class code).
  All localStorage. The single internal class lives in createdChildren.ts.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

// ---------------------------------------------------------------- parent links
const LINK_KEY = "alashbal:demo-parent-child-links";
const LINK_EVENT = "alashbal:demo-parent-child-links-changed";

export interface DemoParentChildLink {
  id: string;
  parentId: string;
  childId: string;
  linkedAt: string;
  status: "active";
}

const EMPTY_LINKS: DemoParentChildLink[] = [];

function readLinks(): DemoParentChildLink[] {
  if (typeof window === "undefined") return EMPTY_LINKS;
  try {
    const raw = window.localStorage.getItem(LINK_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as DemoParentChildLink[]) : EMPTY_LINKS;
  } catch {
    return EMPTY_LINKS;
  }
}
function writeLinks(list: DemoParentChildLink[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LINK_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(LINK_EVENT));
}

/** Link a parent to a child. Returns false if the link already exists. */
export function addParentChildLink(parentId: string, childId: string): boolean {
  const list = readLinks();
  if (list.some((l) => l.parentId === parentId && l.childId === childId)) return false;
  writeLinks([
    ...list,
    { id: `pcl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, parentId, childId, linkedAt: new Date().toISOString(), status: "active" },
  ]);
  return true;
}
export function removeParentChildLink(parentId: string, childId: string) {
  writeLinks(readLinks().filter((l) => !(l.parentId === parentId && l.childId === childId)));
}
export function getLinkedChildIdsForParent(parentId: string): string[] {
  return readLinks().filter((l) => l.parentId === parentId).map((l) => l.childId);
}
export function isChildLinkedToParent(parentId: string, childId: string): boolean {
  return readLinks().some((l) => l.parentId === parentId && l.childId === childId);
}

// --------------------------------------------------------------- link codes
const CODE_KEY = "alashbal:demo-child-link-codes";
const CODE_EVENT = "alashbal:demo-child-link-codes-changed";

export type LinkCodePurpose = "parent_claim_child" | "child_access_parent_created";

export interface DemoChildLinkCode {
  code: string;
  childId: string;
  purpose: LinkCodePurpose;
  createdAt: string;
  usedAt?: string;
}

function readCodes(): DemoChildLinkCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CODE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as DemoChildLinkCode[]) : [];
  } catch {
    return [];
  }
}
function writeCodes(list: DemoChildLinkCode[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CODE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(CODE_EVENT));
}
function normalize(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/** Get (or create once) the link code of a given purpose for a child. */
export function getOrCreateChildCode(childId: string, purpose: LinkCodePurpose): string {
  const list = readCodes();
  const existing = list.find((c) => c.childId === childId && c.purpose === purpose);
  if (existing) return existing.code;
  const prefix = purpose === "parent_claim_child" ? "WLD" : "TLB";
  const code = `${prefix}-${Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5).padEnd(5, "0")}`;
  writeCodes([...list, { code, childId, purpose, createdAt: new Date().toISOString() }]);
  return code;
}

/** Find a code record by entered text (case/space-insensitive), or null. */
export function findChildLinkCode(input: string): DemoChildLinkCode | null {
  const wanted = normalize(input);
  if (!wanted) return null;
  return readCodes().find((c) => normalize(c.code) === wanted) ?? null;
}

export function markCodeUsed(code: string) {
  const list = readCodes();
  const idx = list.findIndex((c) => normalize(c.code) === normalize(code));
  if (idx < 0) return;
  const next = [...list];
  next[idx] = { ...next[idx], usedAt: new Date().toISOString() };
  writeCodes(next);
}

// ------------------------------------------------------------- active child
const ACTIVE_KEY = "alashbal:demo-active-child";
const ACTIVE_EVENT = "alashbal:demo-active-child-changed";

export function setActiveChild(childId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_KEY, childId);
  window.dispatchEvent(new CustomEvent(ACTIVE_EVENT));
}
export function getActiveChildId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}
export function clearActiveChildId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new CustomEvent(ACTIVE_EVENT));
}

// --------------------------------------------------------------- reactive hooks
function makeSubscribe(eventName: string) {
  return (cb: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(eventName, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(eventName, cb);
      window.removeEventListener("storage", cb);
    };
  };
}
const subscribeLinks = makeSubscribe(LINK_EVENT);
const subscribeActive = makeSubscribe(ACTIVE_EVENT);

export function useLinkedChildIdsForParent(parentId: string): string[] {
  const cache = useRef<{ sig: string; value: string[] }>({ sig: "∅", value: EMPTY_LINKS as unknown as string[] });
  const getSnapshot = useCallback((): string[] => {
    const ids = getLinkedChildIdsForParent(parentId);
    const sig = JSON.stringify(ids);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: ids };
    return ids;
  }, [parentId]);
  const getServer = useCallback((): string[] => EMPTY_LINKS as unknown as string[], []);
  return useSyncExternalStore(subscribeLinks, getSnapshot, getServer);
}

export function useActiveChildId(): string | null {
  const getSnapshot = useCallback(() => getActiveChildId(), []);
  const getServer = useCallback(() => null, []);
  return useSyncExternalStore(subscribeActive, getSnapshot, getServer);
}
