"use client";

/*
  الأشبال — DEMO child display-profile overrides, keyed by childId.

  The child's display name + avatar can be edited from /settings?role=child.
  Because the SAME child is shown to the parent (and elsewhere) by childId, the
  override is stored per childId so every view of that child stays in sync.
  Own localStorage key — never touches other demo stores. Falls back to the
  seed child profile when there is no override.
*/
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { childProfiles } from "@/lib/data/children";
import { childAvatarById } from "@/lib/avatars";
import { getCreatedChildById } from "./createdChildren";

export interface ChildDisplay {
  displayName: string;
  avatarUrl?: string;
}
export type ChildOverride = Partial<ChildDisplay>;
type OverrideMap = Record<string, ChildOverride>;

const KEY = "alashbal:child-overrides";
const EVENT = "alashbal:child-overrides-changed";
const EMPTY: OverrideMap = {};

/** Seed (default) display profile for a child id — created children win over seed. */
export function seedChildDisplay(childId: string): ChildDisplay {
  const created = getCreatedChildById(childId);
  if (created) return { displayName: created.displayName, avatarUrl: created.avatar ?? childAvatarById(childId) };
  const c = childProfiles.find((x) => x.id === childId);
  return { displayName: c?.displayName ?? "طفل", avatarUrl: childAvatarById(childId) };
}

function readAll(): OverrideMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as OverrideMap) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(map: OverrideMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function resolve(childId: string, map: OverrideMap): ChildDisplay {
  const seed = seedChildDisplay(childId);
  const ov = map[childId];
  return ov ? { displayName: ov.displayName || seed.displayName, avatarUrl: ov.avatarUrl ?? seed.avatarUrl } : seed;
}

// ---- imperative API --------------------------------------------------------

export function getChildOverride(childId: string): ChildOverride {
  return readAll()[childId] ?? {};
}
export function getChildDisplayProfile(childId: string): ChildDisplay {
  return resolve(childId, readAll());
}
export function setChildOverride(childId: string, patch: ChildOverride) {
  const map = readAll();
  writeAll({ ...map, [childId]: { ...map[childId], ...patch } });
}
export function resetChildOverride(childId: string) {
  const map = readAll();
  if (!(childId in map)) return;
  const next = { ...map };
  delete next[childId];
  writeAll(next);
}

// ---- reactive hook ---------------------------------------------------------

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function useOverrides(): OverrideMap {
  const cache = useRef<{ sig: string; value: OverrideMap }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): OverrideMap => {
    const map = readAll();
    const sig = JSON.stringify(map);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: map };
    return map;
  }, []);
  const getServerSnapshot = useCallback((): OverrideMap => EMPTY, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useChildDisplayProfile(childId: string): ChildDisplay {
  const map = useOverrides();
  return useMemo(() => resolve(childId, map), [childId, map]);
}
