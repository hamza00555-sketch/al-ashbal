"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card } from "@/components";
import { cn } from "@/lib/cn";
import {
  addEnrollment,
  findHalaqaByCode,
  removeEnrollment,
  useEnrolledChildIdsForParent,
  type HalaqaMatch,
} from "@/lib/demo/halaqaEnrollment";
import {
  createDemoChildForParent,
  useCreatedChildrenForParent,
  type DemoCreatedChild,
} from "@/lib/demo/createdChildren";

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";
const fieldLabel = "text-caption text-on-dark-muted";

// A small set of child avatars for the create form (optional choice).
const AVATARS = [
  "/assets/avatars/avatar_child_boy_01.png",
  "/assets/avatars/avatar_child_girl_01.png",
];
const LEVELS = ["مبتدئ", "متوسط", "متقدم"];

/**
 * Single-halaqa enrollment: the parent enters THE halaqa code, then creates a
 * new child profile and links it to the current halaqa. No multi-halaqa UI, no
 * demo-child picker. All local (localStorage).
 */
export function LinkChildPicker({ parentId }: { parentId: string }) {
  const enrolledIds = useEnrolledChildIdsForParent(parentId);
  const myChildren = useCreatedChildrenForParent(parentId);

  const [codeInput, setCodeInput] = useState("");
  const [match, setMatch] = useState<HalaqaMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  // create-child form
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function checkCode() {
    setSuccess(null);
    const found = findHalaqaByCode(codeInput);
    if (!found) {
      setMatch(null);
      setError("كود الحلقة غير صحيح");
      return;
    }
    setError(null);
    setMatch(found);
  }

  function createAndLink(e: React.FormEvent) {
    e.preventDefault();
    if (!match) return;
    const nm = name.trim();
    if (!nm) {
      setFormError("اكتب اسم الطفل.");
      return;
    }
    setFormError(null);
    const child = createDemoChildForParent(parentId, {
      displayName: nm,
      avatar,
      age: age.trim() ? Number(age) : undefined,
      level: level || undefined,
      halaqaId: match.halaqaId,
    });
    addEnrollment({ halaqaId: match.halaqaId, halaqaCode: match.code, parentId, childId: child.id });
    setSuccess(`تم إنشاء ${nm} وربطه بالحَلَقة.`);
    setName("");
    setAge("");
    setLevel("");
    setAvatar(AVATARS[0]);
  }

  function linkExisting(c: DemoCreatedChild) {
    if (!match) return;
    addEnrollment({ halaqaId: match.halaqaId, halaqaCode: match.code, parentId, childId: c.id });
    setSuccess(`تم ربط ${c.displayName} بالحَلَقة.`);
  }

  function unlinkExisting(c: DemoCreatedChild) {
    removeEnrollment(parentId, c.id);
    setSuccess(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step 1 — enter the halaqa code */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">١ — كود الحلقة</span>
        <p className="text-caption text-on-dark-muted">اطلب كود الحلقة من معلّم طفلك ثم أدخله هنا.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={codeInput}
            onChange={(e) => { setCodeInput(e.target.value); setError(null); }}
            placeholder="مثال: HLQ-XXXXX"
            className={inputClass}
            onKeyDown={(e) => { if (e.key === "Enter") checkCode(); }}
          />
          <div className="sm:w-40 sm:shrink-0">
            <Button variant="primary" fullWidth onClick={checkCode}>تحقّق من الكود</Button>
          </div>
        </div>
        {error && <Badge tone="danger">{error}</Badge>}
        {match && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">كود صحيح</Badge>
            <span className="text-body font-bold">الحلقة: {match.name}</span>
          </div>
        )}
      </Card>

      {/* Step 2 — create a new child and link to the (single) halaqa */}
      {match && (
        <Card className="flex flex-col gap-3">
          <span className="text-card-title font-bold">٢ — إنشاء طفل جديد</span>
          <form onSubmit={createAndLink} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <span className={fieldLabel}>الصورة (اختياري)</span>
              <div className="flex gap-2">
                {AVATARS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    aria-pressed={avatar === src}
                    onClick={() => setAvatar(src)}
                    className={cn(
                      "rounded-pill p-1 transition",
                      avatar === src ? "ring-2 ring-purple" : "ring-1 ring-purple/15 hover:ring-purple/40",
                    )}
                  >
                    <Avatar name="أفاتار" size="lg" src={src} />
                  </button>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>اسم الطفل *</span>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(null); }}
                placeholder="مثال: عبدالله"
                className={inputClass}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>العمر (اختياري)</span>
                <input
                  type="number"
                  min={3}
                  max={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="مثال: 12"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>المستوى (اختياري)</span>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
            </div>
            {formError && <Badge tone="danger">{formError}</Badge>}
            <div className="sm:max-w-xs">
              <Button type="submit" variant="primary" fullWidth>إنشاء الطفل وربطه بالحَلَقة</Button>
            </div>
            {success && <p className="text-caption font-bold text-mint">{success}</p>}
          </form>
        </Card>
      )}

      {/* Children this parent created — re-link / unlink to the single halaqa */}
      {match && myChildren.length > 0 && (
        <Card className="flex flex-col gap-3">
          <span className="text-card-title font-bold">أطفالك</span>
          <div className="flex flex-col gap-2">
            {myChildren.map((c) => {
              const isLinked = enrolledIds.includes(c.id);
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-md bg-surface-raised p-3 ring-1 ring-purple/10">
                  <Avatar name={c.displayName} size="md" src={c.avatar} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="break-words text-body font-bold">{c.displayName}</span>
                    {isLinked && <span><Badge tone="success">مرتبط بالحَلَقة</Badge></span>}
                  </div>
                  {isLinked ? (
                    <Button variant="ghost" size="sm" onClick={() => unlinkExisting(c)}>إلغاء الربط</Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => linkExisting(c)}>ربط بالحَلَقة</Button>
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
