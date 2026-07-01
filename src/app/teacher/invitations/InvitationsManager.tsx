"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle, inputClass, fieldLabel, EmptyState } from "@/components";
import {
  createInvitation,
  encodeInvitePayload,
  remainingChildren,
  revokeInvitation,
  statusOf,
  useInvitationsForTeacher,
  type DemoInvitation,
} from "@/lib/demo/invitations";
import { useTeacherSession } from "@/lib/demo/teacherSession";

/** Full PORTABLE link: includes the code + a demo-safe encoded payload so the
 *  link works in another browser/localStorage (local demo only — see store). */
function linkFor(inv: DemoInvitation): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/join?code=${inv.code}&demoInvite=${encodeInvitePayload(inv)}`;
}
function familyMsg(link: string) {
  return `أهلًا، هذه دعوة تسجيل عائلتكم في تطبيق الأشبال. افتحوا الرابط وسجلوا ولي الأمر والأطفال: ${link}`;
}
function studentMsg(link: string) {
  return `أهلًا، هذه دعوة تسجيل طالب في تطبيق الأشبال. افتح الرابط وسجّل بيانات الطالب: ${link}`;
}

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  active: { label: "نشطة", tone: "success" },
  expired: { label: "منتهية", tone: "warning" },
  revoked: { label: "موقوفة", tone: "danger" },
};

/** A created-invitation result card (code + link + copy + WhatsApp message). */
function ResultCard({ inv }: { inv: DemoInvitation }) {
  const link = linkFor(inv);
  const msg = inv.type === "family" ? familyMsg(link) : studentMsg(link);
  const [msgState, setMsgState] = useState<string | null>(null);
  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsgState(`تم نسخ ${what}.`);
    } catch {
      setMsgState("تعذّر النسخ — انسخه يدويًا.");
    }
  }
  return (
    <div className="flex flex-col gap-2 rounded-md bg-purple/5 p-3 ring-1 ring-purple/12">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-surface-raised px-4 py-2 text-h2 font-extrabold tracking-widest text-purple ring-1 ring-purple/15">{inv.code}</span>
        <Badge tone="purple">{inv.type === "family" ? "دعوة عائلة" : "دعوة طالب"}</Badge>
      </div>
      <span className="break-all text-caption text-on-dark-muted">{link}</span>
      <p className="break-words rounded-md bg-surface-raised p-2 text-caption text-on-dark-muted">{msg}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => copy(link, "الرابط")}>نسخ الرابط</Button>
        <Button variant="secondary" size="sm" onClick={() => copy(msg, "رسالة واتساب")}>نسخ رسالة واتساب</Button>
      </div>
      {msgState && <span className="text-caption text-mint">{msgState}</span>}
    </div>
  );
}

export function InvitationsManager({ teacherId }: { teacherId: string }) {
  // Prefer the active teacher-session id (the gate guarantees one is present);
  // fall back to the passed id for safety.
  const session = useTeacherSession();
  const activeTeacherId = session?.teacherId ?? teacherId;
  const invitations = useInvitationsForTeacher(activeTeacherId);

  // family form
  const [famLabel, setFamLabel] = useState("");
  const [famChildren, setFamChildren] = useState("2");
  const [famParents, setFamParents] = useState("1");
  const [famDays, setFamDays] = useState("7");
  const [famResult, setFamResult] = useState<DemoInvitation | null>(null);

  // student form
  const [stuLabel, setStuLabel] = useState("");
  const [stuDays, setStuDays] = useState("7");
  const [stuResult, setStuResult] = useState<DemoInvitation | null>(null);

  function createFamily() {
    if (!session) return; // no teacher session → the gate will require login
    const inv = createInvitation(activeTeacherId, {
      type: "family",
      label: famLabel,
      maxChildren: Number(famChildren),
      maxParents: Number(famParents),
      expiresDays: famDays.trim() ? Number(famDays) : 7,
    });
    setFamResult(inv);
  }
  function createStudent() {
    if (!session) return; // no teacher session → the gate will require login
    const inv = createInvitation(activeTeacherId, {
      type: "student",
      label: stuLabel,
      expiresDays: stuDays.trim() ? Number(stuDays) : 7,
    });
    setStuResult(inv);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section 1 — family invitation */}
      <Card className="flex flex-col gap-3">
        <SectionTitle title="إنشاء دعوة عائلة" subtitle="ولي الأمر يسجّل ويضيف أطفاله" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={fieldLabel}>اسم العائلة (اختياري)</span>
            <input value={famLabel} onChange={(e) => setFamLabel(e.target.value)} placeholder="مثال: عائلة عبدالله" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>عدد الأطفال المسموح</span>
            <select value={famChildren} onChange={(e) => setFamChildren(e.target.value)} className={inputClass}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>عدد أولياء الأمور</span>
            <select value={famParents} onChange={(e) => setFamParents(e.target.value)} className={inputClass}>
              {[1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>صلاحية الدعوة (أيام)</span>
            <input type="number" min={0} value={famDays} onChange={(e) => setFamDays(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={createFamily}>إنشاء دعوة عائلة</Button>
        </div>
        {famResult && <ResultCard inv={famResult} />}
      </Card>

      {/* Section 2 — student invitation */}
      <Card className="flex flex-col gap-3">
        <SectionTitle title="إنشاء دعوة طالب" subtitle="الطالب يسجّل نفسه" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>اسم الطالب (اختياري)</span>
            <input value={stuLabel} onChange={(e) => setStuLabel(e.target.value)} placeholder="مثال: طالب منفرد" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>صلاحية الدعوة (أيام)</span>
            <input type="number" min={0} value={stuDays} onChange={(e) => setStuDays(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={createStudent}>إنشاء دعوة طالب</Button>
        </div>
        {stuResult && <ResultCard inv={stuResult} />}
      </Card>

      {/* Section 3 — existing invitations */}
      <section className="flex flex-col gap-3">
        <SectionTitle title="الدعوات الحالية" subtitle={`${invitations.length} دعوة`} />
        {invitations.length === 0 ? (
          <EmptyState title="لا توجد دعوات بعد" hint="أنشئ دعوة عائلة أو طالب وشاركها." />
        ) : (
          <div className="flex flex-col gap-2">
            {invitations.map((inv) => {
              const st = STATUS_LABEL[statusOf(inv)];
              return (
                <Card key={inv.id} variant="lavender" className="flex flex-wrap items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="purple">{inv.type === "family" ? "عائلة" : "طالب"}</Badge>
                      <span className="font-extrabold tracking-widest text-purple">{inv.code}</span>
                      {inv.label && <span className="text-caption text-on-dark-muted">{inv.label}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={st.tone}>{st.label}</Badge>
                      <span className="text-caption text-on-dark-muted">
                        الأطفال: {inv.usedChildrenCount}/{inv.maxChildren ?? 1}
                        {inv.type === "family" ? ` · متبقٍ ${remainingChildren(inv)}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => navigator.clipboard?.writeText(linkFor(inv)).catch(() => {})}>نسخ الرابط</Button>
                    {statusOf(inv) === "active" && (
                      <Button variant="ghost" size="sm" onClick={() => revokeInvitation(inv.id)}>إيقاف</Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
