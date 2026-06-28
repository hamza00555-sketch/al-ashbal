"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Card } from "@/components";
import { cn } from "@/lib/cn";
import { getMockUser } from "@/lib/data";
import { setRoleOverride } from "@/lib/auth/demoSession";
import { createChild } from "@/lib/demo/createdChildren";
import { addParentChildLink, getOrCreateChildCode, setActiveChild } from "@/lib/demo/onboarding";
import { addDeviceChildId } from "@/lib/demo/deviceChildren";
import {
  findInvitationByCode,
  recordInvitationUse,
  remainingChildren,
  useInvitationByCode,
  validateForUse,
  type DemoInvitation,
} from "@/lib/demo/invitations";

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";
const AVATARS = ["/assets/avatars/avatar_child_boy_01.png", "/assets/avatars/avatar_child_girl_01.png"];
const LEVELS = ["مبتدئ", "متوسط", "متقدم"];

const DEMO_PARENT_ID = getMockUser("parent").id;

interface ChildRow { name: string; age: string; level: string; avatar: string }
const emptyRow = (): ChildRow => ({ name: "", age: "", level: "", avatar: AVATARS[0] });

function AvatarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {AVATARS.map((src) => (
        <button
          key={src}
          type="button"
          aria-pressed={value === src}
          onClick={() => onChange(src)}
          className={cn("rounded-pill p-1 transition", value === src ? "ring-2 ring-purple" : "ring-1 ring-purple/15 hover:ring-purple/40")}
        >
          <Avatar name="أفاتار" size="md" src={src} />
        </button>
      ))}
    </div>
  );
}

// --------------------------------------------------------------- family
function FamilyRegister({ inv }: { inv: DemoInvitation }) {
  const max = inv.maxChildren ?? 1;
  const [parentName, setParentName] = useState("");
  const [rows, setRows] = useState<ChildRow[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; code: string }[] | null>(null);

  function setRow(i: number, patch: Partial<ChildRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!parentName.trim()) { setError("اكتب اسم ولي الأمر."); return; }
    const named = rows.filter((r) => r.name.trim());
    if (named.length === 0) { setError("أضف طفلًا واحدًا على الأقل."); return; }
    // re-validate fresh invitation (status + remaining children)
    const fresh = findInvitationByCode(inv.code);
    const vErr = validateForUse(fresh);
    if (vErr || !fresh) { setError(vErr ?? "كود الدعوة غير صحيح"); return; }
    if (named.length > remainingChildren(fresh)) { setError("تم استخدام عدد الأطفال المسموح لهذه الدعوة"); return; }
    setError(null);
    setRoleOverride("parent", { displayName: parentName.trim() });
    const codes: { name: string; code: string }[] = [];
    for (const r of named) {
      const child = createChild({
        displayName: r.name,
        avatar: r.avatar,
        age: r.age.trim() ? Number(r.age) : undefined,
        level: r.level || undefined,
        createdBy: "parent",
        createdByParentId: DEMO_PARENT_ID,
        viaInvitation: true,
      });
      addParentChildLink(DEMO_PARENT_ID, child.id);
      addDeviceChildId(child.id); // appears in the shared-device child switcher
      codes.push({ name: r.name.trim(), code: getOrCreateChildCode(child.id, "child_access_parent_created") });
    }
    recordInvitationUse(fresh.id, named.length, 1);
    setDone(codes);
  }

  if (done) {
    return (
      <Card className="flex flex-col gap-3">
        <h2 className="text-card-title font-bold">تم تسجيل العائلة بنجاح</h2>
        <p className="text-body text-on-dark-muted">احتفظ بأكواد دخول الأطفال، يمكن لكل طفل استخدامها للدخول إلى ملفه.</p>
        <div className="flex flex-col gap-2">
          {done.map((c) => (
            <div key={c.code} className="flex items-center justify-between gap-2 rounded-md bg-purple/5 p-3 ring-1 ring-purple/12">
              <span className="font-bold">{c.name}</span>
              <span className="font-extrabold tracking-widest text-purple">{c.code}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/parent" className="inline-flex min-h-11 items-center justify-center rounded-md bg-purple px-5 text-button font-bold text-cream ring-1 ring-white/15 transition hover:brightness-110">
            لوحة ولي الأمر
          </Link>
          <Link href="/child/switch" className="inline-flex min-h-11 items-center justify-center rounded-md bg-surface-raised px-5 text-button font-bold text-on-dark ring-1 ring-purple/12 transition hover:bg-purple/8">
            مبدّل الأطفال
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">تسجيل ولي الأمر</span>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>اسم ولي الأمر *</span>
          <input value={parentName} onChange={(e) => { setParentName(e.target.value); setError(null); }} placeholder="مثال: أبو عبدالله" className={inputClass} />
        </label>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-card-title font-bold">إضافة الأطفال</span>
          <Badge tone="purple">حتى {max}</Badge>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-md bg-surface-raised p-3 ring-1 ring-purple/10">
            <div className="flex items-center justify-between gap-2">
              <span className="text-caption font-bold">طفل {i + 1}</span>
              {rows.length > 1 && (
                <button type="button" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} className="text-caption font-bold text-coral hover:brightness-90">حذف</button>
              )}
            </div>
            <AvatarPicker value={row.avatar} onChange={(v) => setRow(i, { avatar: v })} />
            <input value={row.name} onChange={(e) => { setRow(i, { name: e.target.value }); setError(null); }} placeholder="اسم الطفل *" className={inputClass} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="number" min={3} max={18} value={row.age} onChange={(e) => setRow(i, { age: e.target.value })} placeholder="العمر (اختياري)" className={inputClass} />
              <select value={row.level} onChange={(e) => setRow(i, { level: e.target.value })} className={inputClass}>
                <option value="">المستوى (اختياري)</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        ))}
        {rows.length < max && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setRows((r) => [...r, emptyRow()])}>+ أضف طفلًا</Button>
        )}
      </Card>

      {error && <Badge tone="danger">{error}</Badge>}
      <div className="sm:max-w-xs">
        <Button type="submit" variant="primary" fullWidth>إنهاء التسجيل</Button>
      </div>
    </form>
  );
}

// --------------------------------------------------------------- student
function StudentRegister({ inv }: { inv: DemoInvitation }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; code: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("اكتب اسمك."); return; }
    const fresh = findInvitationByCode(inv.code);
    const vErr = validateForUse(fresh);
    if (vErr || !fresh) { setError(vErr ?? "كود الدعوة غير صحيح"); return; }
    setError(null);
    const child = createChild({
      displayName: name,
      avatar,
      age: age.trim() ? Number(age) : undefined,
      level: level || undefined,
      createdBy: "student",
      viaInvitation: true,
    });
    addDeviceChildId(child.id); // appears in the shared-device child switcher
    setActiveChild(child.id);
    recordInvitationUse(fresh.id, 1, 0);
    setDone({ name: name.trim(), code: getOrCreateChildCode(child.id, "parent_claim_child") });
  }

  if (done) {
    return (
      <Card className="flex flex-col gap-3">
        <h2 className="text-card-title font-bold">تم إنشاء ملفك بنجاح</h2>
        <p className="text-body text-on-dark-muted">أعطِ هذا الكود لولي أمرك ليربط حسابه بك:</p>
        <span className="text-h2 font-extrabold tracking-widest text-purple">{done.code}</span>
        <Link href="/child" className="inline-flex min-h-11 items-center justify-center rounded-md bg-purple px-5 text-button font-bold text-cream ring-1 ring-white/15 transition hover:brightness-110 sm:max-w-xs">
          لوحتي
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">تسجيل الطالب</span>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>الصورة (اختياري)</span>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>اسم الطالب *</span>
          <input value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="مثال: مازن" className={inputClass} />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <input type="number" min={3} max={18} value={age} onChange={(e) => setAge(e.target.value)} placeholder="العمر (اختياري)" className={inputClass} />
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
            <option value="">المستوى (اختياري)</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {error && <Badge tone="danger">{error}</Badge>}
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth>تسجيل الطالب</Button>
        </div>
      </Card>
    </form>
  );
}

// --------------------------------------------------------------- entry
export function JoinFlow({ initialCode }: { initialCode?: string }) {
  const [codeInput, setCodeInput] = useState(initialCode ?? "");
  // The code we are actively resolving (auto-read from the URL, or submitted).
  const [activeCode, setActiveCode] = useState(initialCode ?? "");
  // Set true only after the user submits manually, so an empty initial state
  // shows the input without a premature error.
  const [submitted, setSubmitted] = useState(Boolean(initialCode));
  const { inv: resolved, error: resolveError } = useInvitationByCode(activeCode);

  // Lock onto a freshly-resolved valid invitation. Sticky across later store
  // updates, so completing a last/single-use registration keeps the flow (and
  // its success screen) mounted even after the invitation is marked used.
  const [inv, setInv] = useState<DemoInvitation | null>(null);
  if (resolved && resolved.id !== inv?.id) setInv(resolved);

  const error = inv ? null : submitted ? resolveError ?? (activeCode.trim() ? null : "أدخل كود الدعوة.") : null;

  function check(value: string) {
    setInv(null);
    setActiveCode(value);
    setSubmitted(true);
  }

  if (inv) {
    return (
      <div className="flex flex-col gap-4">
        <Card variant="gradient" className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-cream/80">دعوة {inv.type === "family" ? "عائلة" : "طالب"}</span>
            {inv.label && <span className="text-card-title font-bold">{inv.label}</span>}
          </div>
          <Badge tone="success" onAccent>كود صحيح</Badge>
        </Card>
        {inv.type === "family" ? <FamilyRegister inv={inv} /> : <StudentRegister inv={inv} />}
      </div>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <span className="text-card-title font-bold">لدي دعوة</span>
      <p className="text-caption text-on-dark-muted">أدخل كود الدعوة الذي أرسله لك المعلم.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={codeInput}
          onChange={(e) => { setCodeInput(e.target.value); setSubmitted(false); }}
          placeholder="مثال: FAM-XXXX"
          className={inputClass}
          onKeyDown={(e) => { if (e.key === "Enter") check(codeInput); }}
        />
        <div className="sm:w-40 sm:shrink-0">
          <Button variant="primary" fullWidth onClick={() => check(codeInput)}>متابعة</Button>
        </div>
      </div>
      {error && <Badge tone="danger">{error}</Badge>}
    </Card>
  );
}
