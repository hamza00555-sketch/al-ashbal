"use client";

/*
  الأشبال — client-side demo notifications store (Phase 01 · Task 8.2).
  PROTOTYPE ONLY: notifications live in localStorage, keyed by target userId,
  so parent/teacher workflows can notify the child/parent within the same
  browser. Nothing is saved to a backend.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export interface DemoNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type?: string;
  createdAt: string;
  readAt?: string;
}

const KEY = "alashbal:notifications";
const EVENT = "alashbal:notifications-changed";
const EMPTY: DemoNotification[] = [];

function readAll(): DemoNotification[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoNotification[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(list: DemoNotification[]) {
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

/** Add a new notification targeted at a userId. */
export function pushNotification(input: {
  userId: string;
  title: string;
  body: string;
  type?: string;
}) {
  const item: DemoNotification = {
    id: `dn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  writeAll([item, ...readAll()]);
}

export function markNotificationRead(id: string) {
  writeAll(
    readAll().map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)),
  );
}

/** Idempotently seed the store with the static (db) notifications for a viewer. */
export function ensureSeed(seed: DemoNotification[]) {
  if (typeof window === "undefined" || seed.length === 0) return;
  const list = readAll();
  const existing = new Set(list.map((n) => n.id));
  const toAdd = seed.filter((s) => !existing.has(s.id));
  if (toAdd.length > 0) writeAll([...toAdd, ...list]);
}

export function useDemoNotifications(userId: string): DemoNotification[] {
  const cache = useRef<{ sig: string; value: DemoNotification[] }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): DemoNotification[] => {
    const list = readAll()
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const sig = JSON.stringify(list);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: list };
    return list;
  }, [userId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
