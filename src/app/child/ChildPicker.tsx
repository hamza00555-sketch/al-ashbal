"use client";

/*
  من يستخدم التطبيق الآن؟ — the shared-family-device child profile switcher.
  Used both as the gate (when no active child is selected) and as the /child/switch
  screen. This is a family-device profile picker, NOT an account login.
*/
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, ChildDisplayAvatar, ChildDisplayName, SectionTitle } from "@/components";
import { childAvatarSrc } from "@/lib/avatars";
import type { ChildProfile } from "@/types";
import { getCreatedChildById } from "@/lib/demo/createdChildren";
import { findChildLinkCode, setActiveChild } from "@/lib/demo/onboarding";
import {
  addDeviceChildId,
  getSeedDemoChild,
  useAvailableChildren,
} from "@/lib/demo/deviceChildren";

const inputClass =
  "min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft";

function ChildCard({ child, onPick }: { child: ChildProfile; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex flex-col items-center gap-2 rounded-lg bg-surface-raised p-4 text-center text-on-light shadow-soft ring-1 ring-purple/12 transition hover:bg-purple/5"
    >
      <span className="rounded-pill p-1 ring-2 ring-purple-soft/50">
        <ChildDisplayAvatar childId={child.id} fallbackName={child.displayName} fallbackSrc={childAvatarSrc(child.gender)} size="profile" />
      </span>
      <span className="w-full break-words text-card-title font-bold">
        <ChildDisplayName childId={child.id} fallback={child.displayName} />
      </span>
      {child.age ? <span className="text-caption text-[#5F4B7A]">{child.age} سنة</span> : null}
      <span className="mt-1 inline-flex min-h-9 items-center rounded-md bg-purple px-4 text-caption font-bold text-cream">
        هذا أنا
      </span>
    </button>
  );
}

export function ChildPicker({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const available = useAvailableChildren();
  const seed = getSeedDemoChild();
  const seedIsAvailable = seed ? available.some((c) => c.id === seed.id) : false;

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  function pick(childId: string) {
    addDeviceChildId(childId);
    setActiveChild(childId);
    if (redirectTo) router.push(redirectTo);
  }

  function enterCode() {
    const rec = findChildLinkCode(code);
    // Only the child ACCESS code (parent-created child) activates a profile here.
    if (!rec || rec.purpose !== "child_access_parent_created") {
      setCodeError("كود الدخول غير صحيح");
      return;
    }
    const child = getCreatedChildById(rec.childId);
    if (!child) {
      setCodeError("كود الدخول غير صحيح");
      return;
    }
    setCodeError(null);
    setCode("");
    pick(child.id);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card variant="gradient" className="flex flex-col gap-1.5">
        <h1 className="text-h2 font-extrabold">من يستخدم التطبيق الآن؟</h1>
        <p className="text-body text-cream/85">
          اختر ملفك قبل بدء المهام، حتى تُسجّل النقاط والتسميع باسمك الصحيح.
        </p>
      </Card>

      {available.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {available.map((child) => (
            <ChildCard key={child.id} child={child} onPick={() => pick(child.id)} />
          ))}
        </div>
      ) : (
        <Card variant="lavender" className="flex flex-col gap-2">
          <span className="text-card-title font-bold">لا يوجد ملف طفل على هذا الجهاز بعد</span>
          <p className="text-body text-on-dark-muted">
            أدخل كود دخول الطفل الذي أعطاك إياه ولي أمرك، أو اطلب من ولي أمرك تسجيلك.
          </p>
        </Card>
      )}

      {/* Child access code — activate a parent-created child on this device. */}
      <Card className="flex flex-col gap-3">
        <span className="text-card-title font-bold">لدي كود دخول طفل</span>
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

      {/* Local-demo fallback — clearly labelled, not the main product path. */}
      {seed && !seedIsAvailable && (
        <section className="flex flex-col gap-2">
          <SectionTitle title="تجربة محلية" subtitle="ملف تجريبي على هذا الجهاز فقط" />
          <Card variant="lavender" className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <ChildDisplayAvatar childId={seed.id} fallbackName={seed.displayName} fallbackSrc={childAvatarSrc(seed.gender)} size="md" />
              <span className="break-words text-card-title font-bold">
                <ChildDisplayName childId={seed.id} fallback={seed.displayName} />
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => pick(seed.id)}>فتح الملف التجريبي</Button>
          </Card>
        </section>
      )}
    </div>
  );
}
