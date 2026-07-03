"use client";

/* REAL pending approvals for the signed-in parent (Phase 3). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components";
import type { SubmissionState } from "@/lib/supabase/types";
import { approveSubmissionAction, playbackUrlAction, rerecordSubmissionAction } from "./realActions";

export interface ParentSubmissionView {
  id: string;
  childName: string;
  title: string;
  state: SubmissionState;
  createdAt: string;
}

const STATE_LABEL: Record<SubmissionState, { label: string; tone: "warning" | "success" | "danger" | "purple" | "neutral" }> = {
  uploading: { label: "قيد الرفع", tone: "neutral" },
  pending_parent: { label: "بانتظار موافقتك", tone: "warning" },
  pending_teacher: { label: "بانتظار المعلمة", tone: "purple" },
  accepted: { label: "مقبول 🎉", tone: "success" },
  rerecord: { label: "طُلبت إعادة التسجيل", tone: "danger" },
};

export function ParentRealApprovals({ submissions }: { submissions: ParentSubmissionView[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);

  async function play(id: string) {
    setError(null);
    const res = await playbackUrlAction(id);
    if (res.ok) setPlaying({ id, url: res.url });
    else setError("تعذّر تشغيل التسجيل.");
  }

  async function act(id: string, kind: "approve" | "rerecord") {
    setBusyId(id);
    setError(null);
    const res =
      kind === "approve"
        ? await approveSubmissionAction(id)
        : await rerecordSubmissionAction(id);
    if (!res.ok) setError(res.message ?? null);
    setBusyId(null);
    router.refresh();
  }

  if (submissions.length === 0) {
    return <p className="text-body text-on-light-muted">لا تسميعات من أطفالك بعد.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <Badge tone="danger">{error}</Badge>}
      {submissions.map((s) => (
        <div key={s.id} className="flex flex-col gap-2 rounded-md bg-purple/5 px-3 py-2 ring-1 ring-purple/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body font-bold text-on-dark">{s.childName}</span>
            <span className="text-caption text-on-light-muted">{s.title}</span>
            <Badge tone={STATE_LABEL[s.state].tone}>{STATE_LABEL[s.state].label}</Badge>
          </div>
          {playing?.id === s.id && (
            <audio controls autoPlay src={playing.url} className="w-full" />
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => play(s.id)}>▶ استماع</Button>
            {s.state === "pending_parent" && (
              <>
                <Button variant="primary" size="sm" disabled={busyId === s.id} onClick={() => act(s.id, "approve")}>
                  {busyId === s.id ? "جاري..." : "موافقة وإرسال للمعلمة"}
                </Button>
                <Button variant="secondary" size="sm" disabled={busyId === s.id} onClick={() => act(s.id, "rerecord")}>
                  إعادة التسجيل
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
