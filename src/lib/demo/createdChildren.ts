"use client";

/*
  الأشبال — DEMO parent-created children (local only, no backend).

  The parent creates a child profile from /parent/link-child and links it (via
  the enrollment store) to the app's SINGLE current halaqa. These children
  behave like normal children everywhere (parent + teacher rosters, attendance,
  child detail). Stored in its OWN localStorage key. There is intentionally NO
  multi-halaqa concept here — `halaqaId` is kept internally only.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ChildProfile } from "@/types";
import { childProfiles } from "@/lib/data/children";

export interface DemoCreatedChild {
  id: string;
  displayName: string;
  avatar?: string;
  age?: number;
  level?: string;
  /** Internal: the single current halaqa this child belongs to (not exposed in UI). */
  halaqaId: string;
  createdByParentId: string;
  createdAt: string;
}

const KEY = "alashbal:demo-created-children";
const EVENT = "alashbal:demo-created-children-changed";
const EMPTY: DemoCreatedChild[] = [];

function readAll(): DemoCreatedChild[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DemoCreatedChild[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: DemoCreatedChild[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// ---- imperative API --------------------------------------------------------

export function getCreatedChildren(): DemoCreatedChild[] {
  return readAll();
}

export function getCreatedChildById(childId: string): DemoCreatedChild | null {
  return readAll().find((c) => c.id === childId) ?? null;
}

export function getCreatedChildrenForParent(parentId: string): DemoCreatedChild[] {
  return readAll().filter((c) => c.createdByParentId === parentId);
}

/** Create a new local child for a parent, linked (internally) to the single halaqa. */
export function createDemoChildForParent(
  parentId: string,
  input: { displayName: string; avatar?: string; age?: number; level?: string; halaqaId: string },
): DemoCreatedChild {
  const child: DemoCreatedChild = {
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    displayName: input.displayName.trim(),
    avatar: input.avatar,
    age: input.age,
    level: input.level,
    halaqaId: input.halaqaId,
    createdByParentId: parentId,
    createdAt: new Date().toISOString(),
  };
  writeAll([...readAll(), child]);
  return child;
}

// ---- unified child resolution (created first, then seed) -------------------

/** Normalize a created child into the shared ChildProfile shape. */
function toProfile(c: DemoCreatedChild): ChildProfile {
  return {
    id: c.id,
    userId: "", // created children have no child-app login (demo limitation)
    displayName: c.displayName,
    age: c.age,
    gender: "male",
    halaqaId: c.halaqaId,
    parentIds: [c.createdByParentId],
    isActive: true,
  };
}

/** Resolve a child by id from the created store first, then the seed roster. */
export function getDemoChildById(childId: string): ChildProfile | null {
  const created = getCreatedChildById(childId);
  if (created) return toProfile(created);
  return childProfiles.find((c) => c.id === childId) ?? null;
}

/** All demo children (created + seed). */
export function getAllDemoChildren(): ChildProfile[] {
  return [...readAll().map(toProfile), ...childProfiles];
}

// ---- reactive hook ---------------------------------------------------------

export function useCreatedChildrenForParent(parentId: string): DemoCreatedChild[] {
  const cache = useRef<{ sig: string; value: DemoCreatedChild[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): DemoCreatedChild[] => {
    const list = getCreatedChildrenForParent(parentId);
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [parentId]);
  const getServer = useCallback((): DemoCreatedChild[] => EMPTY, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServer);
}
