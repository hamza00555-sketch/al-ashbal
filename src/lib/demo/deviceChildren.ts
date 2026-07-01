"use client";

/*
  الأشبال — DEMO shared-family-device child session (local only, no backend).

  One family device can hold MULTIPLE child profiles. The child area picks the
  ACTIVE child (من يستخدم التطبيق الآن؟) and all child tasks/progress/submissions
  use that child. This module resolves which children are available on THIS
  device and exposes the active-child selection.

  Sources of "children on this device" (created/local resolve BEFORE seed):
    1. parent-created children on this device      (createdChildren store)
    2. children linked to the parent on this device (onboarding parent links)
    3. children activated by a child access code     (device child-ids list)
    4. a self-registered student profile             (createdChildren store)
    5. seed/demo child — only as a labelled fallback, never the main path
*/
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ChildProfile } from "@/types";
import { getMockUser } from "@/lib/data";
import { childProfiles } from "@/lib/data/children";
import { getCreatedChildren, getDemoChildById } from "./createdChildren";
import {
  getActiveChildId,
  getLinkedChildIdsForParent,
  useActiveChildId,
} from "./onboarding";

// The demo parent whose children share this device.
const DEMO_PARENT_ID = getMockUser("parent").id;

// Explicit device child-ids — captures code-activated / fallback children that
// aren't otherwise discoverable. Created + linked children are merged on read.
const DEVICE_KEY = "alashbal:demo-device-child-ids";
const DEVICE_EVENT = "alashbal:demo-device-child-ids-changed";
const EMPTY: ChildProfile[] = [];

function readDeviceIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEVICE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}
function writeDeviceIds(list: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEVICE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(DEVICE_EVENT));
}

export function getDeviceChildIds(): string[] {
  return readDeviceIds();
}
export function addDeviceChildId(childId: string) {
  const list = readDeviceIds();
  if (list.includes(childId)) return;
  writeDeviceIds([...list, childId]);
}
export function removeDeviceChildId(childId: string) {
  writeDeviceIds(readDeviceIds().filter((id) => id !== childId));
}

/** Demo reset: clears ONLY the device child-ids list. */
export function resetDeviceChildIds() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEVICE_KEY);
  window.dispatchEvent(new CustomEvent(DEVICE_EVENT));
}

/** The seed/demo child — offered ONLY as a clearly-labelled local fallback. */
export function getSeedDemoChild(): ChildProfile | null {
  return childProfiles[0] ?? null;
}

/**
 * All child profiles available on THIS device. Created/local children resolve
 * before seed children. The seed child is NOT included here — it is offered
 * separately as a labelled fallback (getSeedDemoChild).
 */
export function getAvailableChildrenForThisDevice(): ChildProfile[] {
  const seen = new Set<string>();
  const out: ChildProfile[] = [];
  const push = (id: string) => {
    if (seen.has(id)) return;
    const profile = getDemoChildById(id);
    if (!profile) return;
    // Skip the bare seed child here (offered as a labelled fallback instead),
    // unless it was explicitly activated/linked on this device.
    seen.add(id);
    out.push(profile);
  };
  // 1 + 4 — created children (parent-created + self-registered + code-activated)
  for (const c of getCreatedChildren()) push(c.id);
  // 2 — children linked to the parent on this device
  for (const id of getLinkedChildIdsForParent(DEMO_PARENT_ID)) push(id);
  // 3 — explicitly activated device children (e.g. via child access code)
  for (const id of getDeviceChildIds()) push(id);
  // the active child is always available
  const active = getActiveChildId();
  if (active) push(active);
  return out;
}

// ---- reactive hooks --------------------------------------------------------

const DEVICE_EVENTS = [
  "alashbal:demo-created-children-changed",
  "alashbal:demo-parent-child-links-changed",
  DEVICE_EVENT,
  "alashbal:demo-active-child-changed",
  "storage",
];
function subscribeAll(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  DEVICE_EVENTS.forEach((e) => window.addEventListener(e, cb));
  return () => DEVICE_EVENTS.forEach((e) => window.removeEventListener(e, cb));
}

function sigOf(list: ChildProfile[]): string {
  return JSON.stringify(list.map((c) => [c.id, c.displayName, c.age, c.halaqaId]));
}

/** Reactive list of children available on this device (created-first). */
export function useAvailableChildren(): ChildProfile[] {
  const cache = useRef<{ sig: string; value: ChildProfile[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): ChildProfile[] => {
    const list = getAvailableChildrenForThisDevice();
    const sig = sigOf(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, []);
  return useSyncExternalStore(subscribeAll, getSnapshot, () => EMPTY);
}

/** Reactive resolution of the active child (created-first, then seed). */
export function useResolvedActiveChild(): { child: ChildProfile | null } {
  const activeId = useActiveChildId();
  const available = useAvailableChildren();
  const child = activeId
    ? available.find((c) => c.id === activeId) ?? getDemoChildById(activeId)
    : null;
  return { child };
}

/** True only AFTER client hydration (SSR-safe; no setState-in-effect). Lets the
 *  gate render a neutral placeholder instead of flashing the picker. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
