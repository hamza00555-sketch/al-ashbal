"use client";

/*
  REAL recitation (Phase 3) — shown ONLY for children this device holds a
  grant for. Records audio, uploads to the PRIVATE bucket via a server-minted
  signed URL, then finalizes the submission row. Clearly labeled real (يصل
  للمعلمة) vs the local demo tasks below it.
*/
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import { getChildGrant } from "@/lib/demo/childGrants";
import type { Submission } from "@/lib/supabase/types";
import {
  finalizeRecitationAction,
  getChildRecitationContext,
  startRecitationUploadAction,
} from "./realActions";

type Phase = "idle" | "recording" | "uploading" | "done" | "error";

const STATE_LABEL: Record<Submission["state"], { label: string; tone: "warning" | "success" | "danger" | "purple" | "neutral" }> = {
  uploading: { label: "قيد الرفع", tone: "neutral" },
  pending_parent: { label: "بانتظار موافقة ولي الأمر", tone: "warning" },
  pending_teacher: { label: "بانتظار مراجعة المعلمة", tone: "purple" },
  accepted: { label: "مقبول 🎉", tone: "success" },
  rerecord: { label: "مطلوب إعادة التسجيل", tone: "danger" },
};

const MAX_SECONDS = 120;

export function RealRecitationCard({ childId }: { childId: string }) {
  const grantToken = typeof window !== "undefined" ? getChildGrant(childId) : null;
  const [ctx, setCtx] = useState<Awaited<ReturnType<typeof getChildRecitationContext>> | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const submitted = phase === "done";
  useEffect(() => {
    let alive = true;
    if (!grantToken) return;
    getChildRecitationContext({ childId, grantToken }).then((r) => {
      if (alive) setCtx(r);
    });
    return () => {
      alive = false;
    };
  }, [childId, grantToken, submitted]); // refresh after a submit

  if (!grantToken) return null; // demo-only child on this device

  const assignment = ctx?.ok ? ctx.assignment : null;
  const recent = ctx?.ok ? ctx.recent : [];

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void upload(new Blob(chunksRef.current, { type: mime }), mime);
      };
      recorderRef.current = recorder;
      recorder.start();
      setPhase("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stopRecording();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("تعذّر الوصول للميكروفون — تأكد من السماح بالتسجيل.");
      setPhase("error");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setPhase("uploading");
  }

  async function upload(blob: Blob, mimeType: string) {
    if (!grantToken) return;
    setPhase("uploading");
    try {
      const start = await startRecitationUploadAction({ childId, grantToken, mimeType });
      if (!start.ok) throw new Error(start.reason);
      const put = await fetch(start.uploadUrl, {
        method: "PUT",
        headers: { "content-type": mimeType, authorization: `Bearer ${start.uploadToken}` },
        body: blob,
      });
      if (!put.ok) throw new Error(`upload ${put.status}`);
      const fin = await finalizeRecitationAction({
        childId,
        grantToken,
        path: start.path,
        mimeType,
        assignmentId: assignment?.id ?? null,
        durationSeconds: seconds,
        title: assignment?.title,
      });
      if (!fin.ok) {
        setError(
          fin.reason === "already_submitted"
            ? "سبق إرسال تسميع لهذه المهمة — بانتظار المراجعة."
            : "تعذّر إرسال التسجيل. حاول مرة أخرى.",
        );
        setPhase("error");
        return;
      }
      setPhase("done");
    } catch {
      setError("تعذّر رفع التسجيل. تأكد من الاتصال وحاول مرة أخرى.");
      setPhase("error");
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SectionTitle title="تسميعي للمعلمة" />
        <Badge tone="gold">حقيقي — يصل للمعلمة</Badge>
      </div>
      {assignment ? (
        <p className="text-body text-on-light-muted">
          المهمة الحالية: <span className="font-bold text-on-dark">{assignment.title}</span>
          {assignment.points ? ` · ${assignment.points} نقطة` : ""}
        </p>
      ) : (
        <p className="text-body text-on-light-muted">سجّل تسميعك وسيصل للمراجعة مباشرة.</p>
      )}

      {phase === "recording" ? (
        <div className="flex items-center gap-3">
          <span aria-hidden className="inline-block size-3 animate-pulse rounded-pill bg-coral" />
          <span className="text-body font-bold text-on-dark">جاري التسجيل… {seconds} ث</span>
          <Button variant="primary" size="sm" onClick={stopRecording}>إيقاف وإرسال</Button>
        </div>
      ) : phase === "uploading" ? (
        <div className="flex items-center gap-3">
          <span aria-hidden className="inline-block size-6 rounded-pill border-[3px] border-purple/20 border-t-purple motion-safe:animate-spin" />
          <span className="text-body font-bold text-on-dark">جاري رفع التسجيل…</span>
        </div>
      ) : phase === "done" ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success">تم الإرسال بنجاح 🎉</Badge>
          <Button variant="secondary" size="sm" onClick={() => setPhase("idle")}>تسجيل آخر</Button>
        </div>
      ) : (
        <div className="sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={startRecording}>🎙️ ابدأ التسجيل</Button>
        </div>
      )}
      {error && <Badge tone="danger">{error}</Badge>}

      {recent.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-bold text-on-dark">آخر تسميعاتي</span>
          {recent.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded-md bg-purple/5 px-3 py-1.5">
              <span className="text-caption text-on-dark">{s.title}</span>
              <Badge tone={STATE_LABEL[s.state].tone}>{STATE_LABEL[s.state].label}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
