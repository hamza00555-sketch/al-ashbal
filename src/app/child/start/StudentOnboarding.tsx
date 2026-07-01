"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Badge, Button, Card } from "@/components";
import { cn } from "@/lib/cn";
import { createChild, getCreatedChildById } from "@/lib/demo/createdChildren";
import { findChildLinkCode, getOrCreateChildCode, setActiveChild } from "@/lib/demo/onboarding";

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";
const AVATARS = ["/assets/avatars/avatar_child_boy_01.png", "/assets/avatars/avatar_child_girl_01.png"];
const LEVELS = ["مبتدئ", "متوسط", "متقدم"];

interface ActiveChild { name: string; avatar?: string }

export function StudentOnboarding() {
  // self-registration
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [parentLinkCode, setParentLinkCode] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveChild | null>(null);

  // access by parent code
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  function register(e: React.FormEvent) {
    e.preventDefault();
    const nm = name.trim();
    if (!nm) {
      setRegError("اكتب اسمك.");
      return;
    }
    setRegError(null);
    const child = createChild({
      displayName: nm,
      avatar,
      age: age.trim() ? Number(age) : undefined,
      level: level || undefined,
      createdBy: "student",
    });
    setActiveChild(child.id);
    const linkCode = getOrCreateChildCode(child.id, "parent_claim_child");
    setParentLinkCode(linkCode);
    setActive({ name: nm, avatar });
  }

  function enterCode() {
    const rec = findChildLinkCode(code);
    if (!rec || rec.purpose !== "child_access_parent_created") {
      setCodeError("كود الدخول غير صحيح");
      return;
    }
    setCodeError(null);
    const child = getCreatedChildById(rec.childId);
    if (!child) {
      setCodeError("كود الدخول غير صحيح");
      return;
    }
    setActiveChild(child.id);
    setActive({ name: child.displayName, avatar: child.avatar });
    setCode("");
  }

  return (
    <div className="flex flex-col gap-4">
      {active && (
        <Card variant="gradient" className="flex items-center gap-3">
          <Avatar name={active.name} size="profile" src={active.avatar} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-caption text-cream/80">أهلاً بك</span>
            <span className="break-words text-h2 font-extrabold">{active.name}</span>
            <span className="text-caption text-cream/75">تم فتح ملفك. تابع إلى لوحتك.</span>
          </div>
          <Link
            href="/child"
            className="ms-auto inline-flex min-h-11 shrink-0 items-center rounded-md bg-surface-raised px-4 text-button font-bold text-on-dark transition hover:bg-purple/8"
          >
            لوحتي
          </Link>
        </Card>
      )}

      {parentLinkCode && (
        <Card className="flex flex-col gap-2">
          <span className="text-card-title font-bold">كود ربط ولي الأمر</span>
          <span className="text-caption text-on-dark-muted">هذا كود ربط ولي أمرك بحسابك — أعطه له:</span>
          <span className="text-h2 font-extrabold tracking-widest text-purple">{parentLinkCode}</span>
        </Card>
      )}

      {/* Register as a student */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">تسجيل طالب</span>
        <form onSubmit={register} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <span className={fieldLabel}>الصورة (اختياري)</span>
            <div className="flex gap-2">
              {AVATARS.map((src) => (
                <button
                  key={src}
                  type="button"
                  aria-pressed={avatar === src}
                  onClick={() => setAvatar(src)}
                  className={cn("rounded-pill p-1 transition", avatar === src ? "ring-2 ring-purple" : "ring-1 ring-purple/15 hover:ring-purple/40")}
                >
                  <Avatar name="أفاتار" size="lg" src={src} />
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>اسمك *</span>
            <input value={name} onChange={(e) => { setName(e.target.value); setRegError(null); }} placeholder="مثال: عبدالله" className={inputClass} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>العمر (اختياري)</span>
              <input type="number" min={3} max={18} value={age} onChange={(e) => setAge(e.target.value)} placeholder="مثال: 12" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>المستوى (اختياري)</span>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                <option value="">—</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
          </div>
          {regError && <Badge tone="danger">{regError}</Badge>}
          <div className="sm:max-w-xs">
            <Button type="submit" variant="primary" fullWidth>تسجيل طالب</Button>
          </div>
        </form>
      </Card>

      {/* Access by a parent-provided code */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">لدي كود من ولي أمري</span>
        <p className="text-caption text-on-dark-muted">أدخل كود دخول الطفل الذي أعطاك إياه ولي أمرك.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setCodeError(null); }}
            placeholder="كود دخول الطفل"
            className={inputClass}
            onKeyDown={(e) => { if (e.key === "Enter") enterCode(); }}
          />
          <div className="sm:w-32 sm:shrink-0">
            <Button variant="primary" fullWidth onClick={enterCode}>دخول</Button>
          </div>
        </div>
        {codeError && <Badge tone="danger">{codeError}</Badge>}
      </Card>
    </div>
  );
}
