"use client";

import { useState } from "react";
import { Badge, Button, Card, ChildDisplayAvatar, ChildDisplayName } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import { childProfiles } from "@/lib/data/children";
import {
  addEnrollment,
  findHalaqaByCode,
  removeEnrollment,
  useEnrolledChildIdsForParent,
  type HalaqaMatch,
} from "@/lib/demo/halaqaEnrollment";

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";

/**
 * Demo-only enrollment by halaqa code. The parent enters the teacher's halaqa
 * code, and only after a VALID code may they pick one of their demo children to
 * enroll into that halaqa. No auto-enrollment; nothing happens without a code.
 */
export function LinkChildPicker({ parentId }: { parentId: string }) {
  const enrolledIds = useEnrolledChildIdsForParent(parentId);
  // The parent's demo children pool (from the seed relationships) — explicit, not auto.
  const available = childProfiles.filter((c) => c.parentIds.includes(parentId));

  const [codeInput, setCodeInput] = useState("");
  const [match, setMatch] = useState<HalaqaMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function checkCode() {
    setMessage(null);
    const found = findHalaqaByCode(codeInput);
    if (!found) {
      setMatch(null);
      setError("كود الحلقة غير صحيح");
      return;
    }
    setError(null);
    setMatch(found);
  }

  function link(childId: string, childName: string) {
    if (!match) return;
    addEnrollment({ halaqaId: match.halaqaId, halaqaCode: match.code, parentId, childId });
    setMessage(`تم ربط ${childName} بـ ${match.name}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step 1 — enter the halaqa code */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">١ — كود الحلقة</span>
        <p className="text-caption text-on-dark-muted">
          اطلب كود الحلقة من معلّم طفلك ثم أدخله هنا.
        </p>
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
            <span className="text-body font-bold">{match.name}</span>
          </div>
        )}
      </Card>

      {/* Step 2 — pick a child to enroll into the matched halaqa */}
      {match && (
        <Card className="flex flex-col gap-3">
          <span className="text-card-title font-bold">٢ — اختر الطفل</span>
          {available.length === 0 ? (
            <p className="text-body text-on-dark-muted">لا يوجد أطفال متاحون للربط في النسخة التجريبية.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {available.map((c) => {
                const isEnrolled = enrolledIds.includes(c.id);
                return (
                  <Card key={c.id} variant="contrast" className="flex items-center gap-3">
                    <ChildDisplayAvatar childId={c.id} fallbackName={c.displayName} fallbackSrc={childAvatarSrc(c.gender)} size="childCard" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-card-title font-bold">
                        <ChildDisplayName childId={c.id} fallback={c.displayName} />
                      </span>
                      {isEnrolled && <Badge tone="success" onLight>مرتبط بالحلقة</Badge>}
                    </div>
                    {isEnrolled ? (
                      <Button variant="ghost" size="sm" onClick={() => { removeEnrollment(parentId, c.id); setMessage(null); }}>إلغاء الربط</Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => link(c.id, c.displayName)}>ربط الطفل بالحَلَقة</Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
          {message && <p className="text-caption text-on-dark-muted">{message}</p>}
        </Card>
      )}
    </div>
  );
}
