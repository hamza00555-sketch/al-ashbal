"use client";

import { useRecordingUrl } from "@/lib/demo/recordings";

/** Plays a recitation recording (audio/video) loaded from IndexedDB. */
export function RecordingPlayer({ recordingId }: { recordingId: string }) {
  const media = useRecordingUrl(recordingId);

  if (!media) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md bg-night text-caption text-on-dark-muted">
        جارٍ تحميل التسجيل…
      </div>
    );
  }

  if (media.type === "video") {
    return <video controls src={media.url} className="aspect-video w-full rounded-md bg-night" />;
  }
  return (
    <div className="flex w-full items-center rounded-md bg-night p-3">
      <audio controls src={media.url} className="w-full" />
    </div>
  );
}
