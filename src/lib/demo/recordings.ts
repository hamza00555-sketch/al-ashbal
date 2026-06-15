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

export interface RecordingMedia {
  url: string;
  type: "audio" | "video";
  mimeType: string;
}

/** Loads a recording from IndexedDB and exposes an object URL (revoked on cleanup). */
export function useRecordingUrl(recordingId: string | null): RecordingMedia | null {
  const [loaded, setLoaded] = useState<{ id: string; media: RecordingMedia } | null>(null);

  useEffect(() => {
    if (!recordingId || typeof indexedDB === "undefined") return;
    let active = true;
    let objectUrl: string | null = null;
    getRecording(recordingId)
      .then((rec) => {
        if (!active || !rec) return;
        objectUrl = URL.createObjectURL(rec.blob);
        setLoaded({ id: recordingId, media: { url: objectUrl, type: rec.type, mimeType: rec.mimeType } });
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recordingId]);

  // Only return media that matches the current id (null while loading / when cleared).
  return loaded && loaded.id === recordingId ? loaded.media : null;
}
