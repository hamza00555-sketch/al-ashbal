"use client";

/*
  الأشبال — demo recordings store (Phase 01 · Task A4).
  PROTOTYPE ONLY: recitation recordings (audio/video Blobs) are kept in
  IndexedDB on THIS device only. No upload, no backend, no real storage.
*/
import { useEffect, useState } from "react";

export interface StoredRecording {
  recordingId: string;
  taskId: string;
  childId: string;
  type: "audio" | "video";
  mimeType: string;
  durationSeconds: number;
  createdAt: string;
  blob: Blob;
}

const DB_NAME = "alashbal";
const DB_VERSION = 1;
const STORE = "recordings";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "recordingId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRecording(recording: StoredRecording): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(recording);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getRecording(recordingId: string): Promise<StoredRecording | null> {
  const db = await openDb();
  const result = await new Promise<StoredRecording | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(recordingId);
    req.onsuccess = () => resolve((req.result as StoredRecording) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function deleteRecording(recordingId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(recordingId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/** Demo reset: deletes ALL recordings from this device's IndexedDB store. */
export async function clearAllRecordings(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export interface RecordingMedia {
  url: string;
  type: "audio" | "video";
  mimeType: string;
}

/** Load status of a recording: still loading, ready, or missing/failed. */
export type RecordingLoadState =
  | { status: "loading" }
  | { status: "ready"; media: RecordingMedia }
  | { status: "error" };

/**
 * Loads a recording from IndexedDB and exposes an object URL (revoked on
 * cleanup). Distinguishes "still loading" from "missing/failed" so the UI can
 * show an error instead of an endless spinner.
 */
export function useRecordingLoad(recordingId: string | null): RecordingLoadState {
  const [loaded, setLoaded] = useState<{ id: string; state: RecordingLoadState }>({
    id: "",
    state: { status: "loading" },
  });

  useEffect(() => {
    if (!recordingId) return;
    let active = true;
    let objectUrl: string | null = null;
    // getRecording rejects if IndexedDB is unavailable or the read fails, and
    // resolves null when the recording is missing — both map to "error".
    getRecording(recordingId)
      .then((rec) => {
        if (!active) return;
        if (!rec) {
          setLoaded({ id: recordingId, state: { status: "error" } });
          return;
        }
        objectUrl = URL.createObjectURL(rec.blob);
        setLoaded({
          id: recordingId,
          state: { status: "ready", media: { url: objectUrl, type: rec.type, mimeType: rec.mimeType } },
        });
      })
      .catch(() => {
        if (active) setLoaded({ id: recordingId, state: { status: "error" } });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recordingId]);

  // Only trust the resolved state when it matches the current id; while a new id
  // is still loading (or none is set), report "loading".
  return loaded.id === (recordingId ?? "") ? loaded.state : { status: "loading" };
}

/** Loads a recording and exposes the media once ready (null while loading/failed). */
export function useRecordingUrl(recordingId: string | null): RecordingMedia | null {
  const state = useRecordingLoad(recordingId);
  return state.status === "ready" ? state.media : null;
}
