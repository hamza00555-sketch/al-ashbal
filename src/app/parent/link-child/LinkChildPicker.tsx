"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card } from "@/components";
import { cn } from "@/lib/cn";
import { setRoleOverride } from "@/lib/auth/demoSession";
import {
  createChild,
  getCreatedChildById,
  useCreatedChildrenForParent,
} from "@/lib/demo/createdChildren";
import {
  addParentChildLink,
  findChildLinkCode,
  getOrCreateChildCode,
  removeParentChildLink,
  useLinkedChildIdsForParent,
} from "@/lib/demo/onboarding";

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";
const AVATARS = ["/assets/avatars/avatar_child_boy_01.png", "/assets/avatars/avatar_child_girl_01.png"];
const LEVELS = ["مبتدئ", "متوسط", "متقدم"];

/**
 * Parent onboarding: register the parent name, then EITHER create a child
 * (and get a child-access code to give to the child) OR link a child who
 * registered himself (using the child's parent-link code). Parent ↔ Child, no
 * halaqa code. All localStorage.
 */
export function LinkChildPicker({ parentId, parentName }: { parentId: string; parentName: string }) {
  const linkedIds = useLinkedChildIdsForParent(parentId);
  const myChildren = useCreatedChildrenForParent(parentId);

  const [name, setNameState] = useState(parentName);
  const [savedParent, setSavedParent] = useState<string | null>(null);

  // create child
  const [cName, setCName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<{ name: string; code: string } | null>(null);

  // link by code
  const [code, setCode] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  function saveParent() {
    const nm = name.trim();
    if (!nm) return;
    setRoleOverride("parent", { displayName: nm });
    setSavedParent(nm);
  }

  function createChildNow(e: React.FormEvent) {
    e.preventDefault();
    const nm = cName.trim();
    if (!nm) {
      setCreateError("اكتب اسم الطفل.");
      return;
    }
    setCreateError(null);
    const child = createChild({
      displayName: nm,
      avatar,
      age: age.trim() ? Number(age) : undefined,
      level: level || undefined,
      createdBy: "parent",
      createdByParentId: parentId,
    });
    addParentChildLink(parentId, child.id);
    const childCode = getOrCreateChildCode(child.id, "child_access_parent_created");
    setAccessCode({ name: nm, code: childCode });
    setCName("");
    setAge("");
    setLevel("");
    setAvatar(AVATARS[0]);
  }

  function linkByCode() {
    setLinkSuccess(null);
    const rec = findChildLinkCode(code);
    if (!rec || rec.purpose !== "parent_claim_child") {
      setLinkError("كود الربط غير صحيح");
      return;
    }
    setLinkError(null);
    const child = getCreatedChildById(rec.childId);
    const added = addParentChildLink(parentId, rec.childId);
    setLinkSuccess(added ? `تم ربط ${child?.displayName ?? "الطفل"} بحسابك.` : "هذا الطفل مرتبط بحسابك مسبقًا.");
    setCode("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Parent profile (name) */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">تسجيل ولي أمر</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setNameState(e.target.value)}
            placeholder="اسم ولي الأمر"
            className={inputClass}
          />
          <div className="sm:w-40 sm:shrink-0">
            <Button variant="secondary" fullWidth onClick={saveParent}>حفظ الاسم</Button>
          </div>
        </div>
        {savedParent && <p className="text-caption font-bold text-mint">تم حفظ: {savedParent}</p>}
      </Card>

      {/* Option 1 — create a child now */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">تسجيل طفلي الآن</span>
        <form onSubmit={createChildNow} className="flex flex-col gap-3">
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
            <span className={fieldLabel}>اسم الطفل *</span>
            <input value={cName} onChange={(e) => { setCName(e.target.value); setCreateError(null); }} placeholder="مثال: نور" className={inputClass} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>العمر (اختياري)</span>
              <input type="number" min={3} max={18} value={age} onChange={(e) => setAge(e.target.value)} placeholder="مثال: 6" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>المستوى (اختياري)</span>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                <option value="">—</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
          </div>
          {createError && <Badge tone="danger">{createError}</Badge>}
          <div className="sm:max-w-xs">
            <Button type="submit" variant="primary" fullWidth>أضف طفلك</Button>
          </div>
        </form>
        {accessCode && (
          <div className="flex flex-col gap-2 rounded-md bg-purple/5 p-3 ring-1 ring-purple/12">
            <span className="text-caption text-on-dark-muted">أعطِ هذا الكود لطفلك ({accessCode.name}) ليدخل إلى ملفه:</span>
            <span className="text-h2 font-extrabold tracking-widest text-purple">{accessCode.code}</span>
          </div>
        )}
      </Card>

      {/* Option 2 — link a self-registered child by code */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">ربط طفل سجّل بنفسه</span>
        <p className="text-caption text-on-dark-muted">أدخل كود ربط الطفل الذي حصل عليه طفلك عند تسجيله بنفسه.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setLinkError(null); }}
            placeholder="كود ربط الطفل"
            className={inputClass}
            onKeyDown={(e) => { if (e.key === "Enter") linkByCode(); }}
          />
          <div className="sm:w-32 sm:shrink-0">
            <Button variant="primary" fullWidth onClick={linkByCode}>ربط</Button>
          </div>
        </div>
        {linkError && <Badge tone="danger">{linkError}</Badge>}
        {linkSuccess && <p className="text-caption font-bold text-mint">{linkSuccess}</p>}
      </Card>

      {/* Children created by this parent — quick code reference + relink */}
      {myChildren.length > 0 && (
        <Card className="flex flex-col gap-3">
          <span className="text-card-title font-bold">أطفالك</span>
          <div className="flex flex-col gap-2">
            {myChildren.map((c) => {
              const isLinked = linkedIds.includes(c.id);
              const childCode = getOrCreateChildCode(c.id, "child_access_parent_created");
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-md bg-surface-raised p-3 ring-1 ring-purple/10">
                  <Avatar name={c.displayName} size="md" src={c.avatar} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="break-words text-body font-bold">{c.displayName}</span>
                    <span className="text-caption text-on-dark-muted">كود دخول الطفل: <span className="font-bold text-purple">{childCode}</span></span>
                  </div>
                  {isLinked ? (
                    <Button variant="ghost" size="sm" onClick={() => removeParentChildLink(parentId, c.id)}>إلغاء الربط</Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => addParentChildLink(parentId, c.id)}>ربط بحسابك</Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
