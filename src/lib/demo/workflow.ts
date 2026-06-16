"use client";

/*
  الأشبال — client-side demo review queue (Phase 01 · Task 8.2).
  PROTOTYPE ONLY: parent-approved recitations + teacher review results live in
  localStorage so /parent/approvals and /teacher/reviews stay in sync within the
  same browser. Nothing is saved to a backend / the mock db.
*/
import { useCallback, useRef, useSyncExternalStore } from "react";

export type ReviewState = "pending" | "accepted" | "rerecord";

export interface ReviewEntry {
  recitationId: string;
  childId: string;
  childName: string;
  title: string;
  childUserId: string;
  parentUserId?: string;
  teacherId?: string;
  state: ReviewState;
  note?: string;
}

type ReviewMap = Record<string, ReviewEntry>;

const KEY = "alashbal:reviews";
const EVENT = "alashbal:reviews-changed";
const EMPTY: ReviewMap = {};

function readAll(): ReviewMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as ReviewMap)
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeAll(map: ReviewMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
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

/** Create or update a review entry (merges with the existing one). */
export function upsertReview(entry: ReviewEntry) {
  const map = readAll();
  writeAll({ ...map, [entry.recitationId]: { ...map[entry.recitationId], ...entry } });
}

export function useReviews(): ReviewMap {
  const cache = useRef<{ sig: string; value: ReviewMap }>({ sig: "∅", value: EMPTY });
  const getSnapshot = useCallback((): ReviewMap => {
    const map = readAll();
    const sig = JSON.stringify(map);
    if (sig === cache.current.sig) return cache.current.value;
    cache.current = { sig, value: map };
    return map;
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
