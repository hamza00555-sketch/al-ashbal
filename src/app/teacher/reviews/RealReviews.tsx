"use client";

/* REAL submissions review panel (Phase 3): pending recitations from the
   database + a tiny «مهمة تسميع» creator. Clearly separated from the local
   demo pipeline below it. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, Input, SectionTitle } from "@/components";
import type { SubmissionState } from "@/lib/supabase/types";
import {
  acceptSubmissionAction,
  createAssignmentAction,
  rerecordSubmissionAction,
  teacherPlaybackUrlAction,
} from "./realActions";

export interface TeacherSubmissionView {
  id: string;
  childName: string;
  title: string;
  state: SubmissionState;
  createdAt: string;
  suggestedPoints: number;
}

export function RealReviews({
  pending,
  assignmentTitle,
}: {
  pending: TeacherSubmissionView[];
  assignmentTitle: string | null;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);
  const [pointsById, setPointsById] = useState<Record<string, string>>({});
  const [newTitle, setNewTitle] = useState("");
  const [newPoints, setNewPoints] = useState("10");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  async function play(id: string) {
    setError(null);
    const res = await teacherPlaybackUrlAction(id);
    if (res.ok) setPlaying({ id, url: res.url });
    else setError("تعذّر تشغيل التسجيل.");
  }

  async function accept(s: TeacherSubmissionView) {
    setBusyId(s.id);
    setError(null);
    const points = Number(pointsById[s.id] ?? s.suggestedPoints) || 0;
    const res = await acceptSubmissionAction({ submissionId: s.id, points });
    if (!res.ok) setError(res.message ?? null);
    setBusyId(null);
    router.refresh();
  }

  async function rerecord(s: TeacherSubmissionView) {
    setBusyId(s.id);
    setError(null);
    const res = await rerecordSubmissionAction({ submissionId: s.id });
    if (!res.ok) setError(res.message ?? null);
    setBusyId(null);
    router.refresh();
  }

  async function createAssignment() {
    if (creating || !newTitle.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    const res = await createAssignmentAction({ title: newTitle, points: Number(newPoints) || null });
    setCreateMsg(res.ok ? "أُنشئت المهمة — سيراها الأطفال في «تسميعي للمعلمة»." : res.message ?? null);
    if (res.ok) setNewTitle("");
    setCreating(false);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SectionTitle title="تسميعات قاعدة البيانات" subtitle="من العائلات المسجّلة — تظهر من أي جهاز" />
        <Badge tone="gold">حقيقي</Badge>
      </div>

      {/* tiny assignment creator */}
      <div className="flex flex-col gap-2 rounded-md bg-purple/5 p-3 ring-1 ring-purple/10">
        <span className="text-caption font-bold text-on-dark">
          مهمة التسميع الحالية: {assignmentTitle ?? "لا مهمة مفتوحة (التسميعات تصل كتسميع حر)"}
        </span>
        <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
          <Field label="مهمة جديدة (عنوان)">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="مثال: سورة الفاتحة" />
          </Field>
          <Field label="نقاطها">
            <Input type="number" min={0} max={100} value={newPoints} onChange={(e) => setNewPoints(e.target.value)} />
          </Field>
          <div className="self-end">
            <Button variant="secondary" size="sm" onClick={createAssignment} disabled={creating}>
              {creating ? "جاري..." : "إنشاء"}
            </Button>
          </div>
        </div>
        {createMsg && <span className="text-caption text-mint">{createMsg}</span>}
      </div>

      {error && <Badge tone="danger">{error}</Badge>}
      {pending.length === 0 ? (
        <p className="text-body text-on-light-muted">لا تسميعات بانتظار مراجعتك حاليًا.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pending.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-md bg-surface-raised px-3 py-2 ring-1 ring-purple/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-bold text-on-dark">{s.childName}</span>
                <span className="text-caption text-on-light-muted">{s.title}</span>
                <Badge tone="purple">بانتظار المراجعة</Badge>
              </div>
              {playing?.id === s.id && (
                    <audio controls autoPlay src={playing.url} className="w-full" />
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => play(s.id)}>▶ استماع</Button>
                <label className="flex items-center gap-1.5 text-caption text-on-light-muted">
                  النقاط
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    value={pointsById[s.id] ?? String(s.suggestedPoints)}
                    onChange={(e) => setPointsById((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  />
                </label>
                <Button variant="primary" size="sm" disabled={busyId === s.id} onClick={() => accept(s)}>
                  {busyId === s.id ? "جاري..." : "قبول ومنح النقاط"}
                </Button>
                <Button variant="secondary" size="sm" disabled={busyId === s.id} onClick={() => rerecord(s)}>
                  طلب إعادة
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
