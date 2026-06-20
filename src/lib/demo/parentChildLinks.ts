"use client";

/*
  الأشبال — DEMO parent↔child links (local only, no backend).

  Empty-first: the parent has NO linked children until they explicitly link one
  from /parent/link-child. Stored in its own localStorage key. This replaces the
  old seed `parentChildLinks` for the parent's views.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export interface ParentChildLinkRecord {
  parentId: string;
  childId: string;
  linkedAt: string;
}

const KEY = "alashbal:demo-parent-child-links";
const EVENT = "alashbal:demo-parent-child-links-changed";
const EMPTY: ParentChildLinkRecord[] = [];

function readAll(): ParentChildLinkRecord[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ParentChildLinkRecord[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: ParentChildLinkRecord[]) {
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

/** Link a child to a parent (no-op if already linked). */
export function addParentChildLink(parentId: string, childId: string) {
  const all = readAll();
  if (all.some((l) => l.parentId === parentId && l.childId === childId)) return;
  writeAll([...all, { parentId, childId, linkedAt: new Date().toISOString() }]);
}

/** Remove a parent↔child link (does NOT delete the child profile/data). */
export function removeParentChildLink(parentId: string, childId: string) {
  writeAll(readAll().filter((l) => !(l.parentId === parentId && l.childId === childId)));
}

export function getLinkedChildIds(parentId: string): string[] {
  return readAll()
    .filter((l) => l.parentId === parentId)
    .map((l) => l.childId);
}

/** Reactive list of childIds linked to a parent. */
export function useLinkedChildIds(parentId: string): string[] {
  const cache = useRef<{ sig: string; value: string[] }>({ sig: "∅", value: EMPTY as unknown as string[] });
  const getSnapshot = useCallback((): string[] => {
    const ids = getLinkedChildIds(parentId);
    const sig = JSON.stringify(ids);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: ids };
    return ids;
  }, [parentId]);
  const getServerSnapshot = useCallback((): string[] => EMPTY as unknown as string[], []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
