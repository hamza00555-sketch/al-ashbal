"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Modal } from "@/components";
import { cn } from "@/lib/cn";
import { pushNotification } from "@/lib/demo/notifications";
import { saveRecording } from "@/lib/demo/recordings";
import { upsertSubmission } from "@/lib/demo/submissions";

export interface RecordTask {
  taskId: string;
  childId: string;
  childName: string;
  childUserId: string;
  parentUserId: string;
  teacherId?: string;
  title: string;
}

type Phase = "idle" | "recording" | "recorded" | "error";

function pickMime(video: boolean): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = video
    ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? "";
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function RecordTaskModal({
  task,
  allowAudio,
  allowVideo,
  onClose,
  onSent,
}: {
  task: RecordTask;
  allowAudio: boolean;
  allowVideo: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const [mode, setMode] = useState<"audio" | "video">(allowVideo && !allowAudio ? "video" : "audio");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [previewNote, setPreviewNote] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const mimeRef = useRef<string>("");
  const timerRef = useRef<number | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Cleanup on unmount (the modal is only mounted while open).
  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach the live stream to the <video> element once it is mounted (fixes the
  // black-screen issue where srcObject was set before the element existed).
  useEffect(() => {
    const video = liveVideoRef.current;
    if (mode === "video" && streaming && video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {
        setPreviewNote("الكاميرا تعمل، لكن المعاينة الحية غير متاحة في هذا المتصفح.");
      });
    }
  }, [mode, streaming]);

  async function startRecording() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("التسجيل غير مدعوم في هذا المتصفح.");
      setPhase("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" });
      streamRef.current = stream;
      setPreviewNote(null);
      if (mode === "video") setStreaming(true); // renders the live <video>; effect attaches the stream
      const mime = pickMime(mode === "video");
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mimeRef.current = recorder.mimeType || mime || (mode === "video" ? "video/webm" : "audio/webm");
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        blobRef.current = blob;
        setRecordedUrl(URL.createObjectURL(blob));
        setPhase("recorded");
        stopTracks();
        setStreaming(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setPhase("recording");
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("لم يتم السماح باستخدام الميكروفون أو الكاميرا.");
      setPhase("error");
      stopTracks();
      setStreaming(false);
    }
  }

  function stopRecording() {
    clearTimer();
    recorderRef.current?.stop();
  }

  function reRecord() {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    blobRef.current = null;
    setSeconds(0);
    setError(null);
    setPreviewNote(null);
    stopTracks();
    setStreaming(false);
    setPhase("idle");
  }

  async function send() {
    const blob = blobRef.current;
    if (!blob) return;
    setSending(true);
    const recordingId = `rec-${Date.now()}`;
    const submissionId = `sub-${Date.now()}`;
    try {
      await saveRecording({
        recordingId,
        taskId: task.taskId,
        childId: task.childId,
        type: mode,
        mimeType: mimeRef.current,
        durationSeconds: seconds,
        createdAt: new Date().toISOString(),
        blob,
      });
    } catch {
      setSending(false);
      setError("تعذّر حفظ التسجيل على هذا الجهاز.");
      return;
    }
    upsertSubmission({
      id: submissionId,
      taskId: task.taskId,
      childId: task.childId,
      childName: task.childName,
      childUserId: task.childUserId,
      parentUserId: task.parentUserId,
      teacherId: task.teacherId,
      title: task.title,
      recordingId,
      recordingType: mode,
      state: "pending_parent",
      createdAt: new Date().toISOString(),
    });
    pushNotification({
      userId: task.parentUserId,
      title: "تسميع جديد بانتظار موافقتك",
      body: `${task.title} — بانتظار مراجعتك.`,
      type: "video_pending_parent",
      href: `/parent/approvals?submissionId=${submissionId}`,
    });
    pushNotification({
      userId: task.childUserId,
      title: "تم إرسال تسميعك لولي الأمر",
      body: "بانتظار موافقة ولي أمرك قبل إرساله للمعلم.",
      type: "submitted",
      href: `/child/tasks?taskId=${task.taskId}`,
    });
    setSending(false);
    onSent();
  }

  return (
    <Modal open onClose={onClose} title="تسجيل التسميع">
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <span className="text-card-title font-bold break-words">{task.title}</span>
          <span className="text-caption text-on-dark-muted">
            نوع التسجيل: {mode === "video" ? "فيديو" : "صوت"}
          </span>
        </div>

        {allowAudio && allowVideo && phase === "idle" && (
          <div className="flex gap-2">
            {(["audio", "video"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  "rounded-pill px-4 py-1 text-caption font-bold transition",
                  mode === m ? "gradient-cta text-cream" : "bg-surface-raised text-on-dark-muted hover:text-on-dark",
                )}
              >
                {m === "audio" ? "تسجيل صوت" : "تسجيل فيديو"}
              </button>
            ))}
          </div>
        )}

        {/* Live camera preview (while the stream is active). */}
        {mode === "video" && streaming && (
          <video ref={liveVideoRef} muted playsInline autoPlay className="aspect-video w-full rounded-md bg-night" />
        )}
        {previewNote && <p className="text-caption text-on-dark-muted">{previewNote}</p>}

        {/* Recorded preview */}
        {phase === "recorded" && recordedUrl && (
          mode === "video" ? (
            <video controls src={recordedUrl} className="aspect-video w-full rounded-md bg-night" />
          ) : (
            <div className="flex w-full items-center rounded-md bg-night p-3">
              <audio controls src={recordedUrl} className="w-full" />
            </div>
          )
        )}

        {phase === "recording" && (
          <div className="flex items-center gap-2">
            <span className="inline-flex size-2.5 animate-pulse rounded-pill bg-coral" />
            <span className="text-h2 font-extrabold">{formatTime(seconds)}</span>
          </div>
        )}

        {error && <Badge tone="danger">{error}</Badge>}

        <div className="flex flex-wrap gap-2">
          {phase === "idle" && (
            <Button variant="primary" onClick={startRecording}>بدء التسجيل</Button>
          )}
          {phase === "recording" && (
            <Button variant="danger" onClick={stopRecording}>إيقاف التسجيل</Button>
          )}
          {phase === "recorded" && (
            <>
              <Button variant="secondary" onClick={reRecord}>إعادة التسجيل</Button>
              <Button variant="primary" onClick={send} disabled={sending}>
                {sending ? "جارٍ الإرسال…" : "إرسال لولي الأمر"}
              </Button>
            </>
          )}
          {phase === "error" && (
            <Button variant="secondary" onClick={reRecord}>المحاولة مرة أخرى</Button>
          )}
        </div>

        <p className="text-caption text-on-dark-muted">
          التسجيل تجريبي ومحفوظ على هذا الجهاز فقط. في النسخة الحقيقية سيتم حفظه بشكل آمن بعد موافقة ولي الأمر.
        </p>
      </div>
    </Modal>
  );
}
