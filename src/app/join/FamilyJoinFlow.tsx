"use client";

/* Family registration via a REAL Supabase invitation (Phase 2).
   Steps: parent account (or existing parent session) + children → ONE server
   action creates everything and returns a device grant token per child. The
   device stores the raw tokens + bridges the children into the local child
   switcher (the child EXPERIENCE itself is still the local demo). */
import { useState } from "react";
import Link from "next/link";
import { AvatarPicker, Badge, Button, Card, Field, Input, SectionTitle } from "@/components";
import { CHILD_AVATARS } from "@/lib/childOptions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { storeChildGrant } from "@/lib/demo/childGrants";
import { registerBackendChildLocally } from "@/lib/demo/createdChildren";
import { addDeviceChildId } from "@/lib/demo/deviceChildren";
import type { RegisteredChild } from "@/lib/backend/families";
import { registerFamilyAction } from "./actions";

interface KidDraft {
  displayName: string;
  avatar: string;
}

const ERROR_COPY: Record<string, string> = {
  invalid_code: "كود الدعوة غير صحيح.",
  invitation_unavailable: "هذه الدعوة لم تعد متاحة (موقوفة أو منتهية).",
  no_slots: "اكتمل عدد الأطفال المسموح لهذه الدعوة.",
  invalid_input: "تأكد من الأسماء والبريد وكلمة مرور (8 أحرف على الأقل).",
  email_exists: "هذا البريد مسجّل بالفعل — سجّل الدخول أولًا ثم افتح رابط الدعوة من جديد.",
  not_a_parent_session: "هذا الحساب ليس حساب ولي أمر — سجّل الخروج ثم افتح الرابط من جديد.",
  server: "تعذّر إتمام التسجيل. حاول مرة أخرى.",
};

export function FamilyJoinFlow({
  code,
  remainingChildren,
  hasParentSession,
  parentName,
}: {
  code: string;
  remainingChildren: number;
  hasParentSession: boolean;
  parentName?: string | null;
}) {
  const maxKids = Math.max(1, Math.min(remainingChildren, 5));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kids, setKids] = useState<KidDraft[]>([{ displayName: "", avatar: CHILD_AVATARS[0].src }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RegisteredChild[] | null>(null);

  function setKid(i: number, patch: Partial<KidDraft>) {
    setKids((prev) => prev.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const children = kids
        .map((k) => ({ displayName: k.displayName.trim(), avatarUrl: k.avatar }))
        .filter((k) => k.displayName);
      const result = await registerFamilyAction({
        code,
        parent: hasParentSession
          ? undefined
          : { displayName: name, email, password },
        children,
      });
      if (!result.ok) {
        setError(ERROR_COPY[result.reason] ?? ERROR_COPY.server);
        setBusy(false);
        return;
      }
      // Device bridge: keep the raw grant tokens + let the local child
      // switcher/experience resolve these REAL children on this device.
      for (const child of result.children) {
        storeChildGrant(child.id, child.grantToken);
        registerBackendChildLocally({ id: child.id, displayName: child.displayName, avatar: child.avatarUrl });
        addDeviceChildId(child.id);
      }
      if (result.createdAccount) {
        // Sign the new parent in on this device (cookies → server sees it).
        try {
          await getSupabaseBrowserClient().auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        } catch {
          // sign-in can be retried from /login — registration itself succeeded
        }
      }
      setDone(result.children);
      setBusy(false);
    } catch {
      setError(ERROR_COPY.server);
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Card className="flex flex-col gap-3">
        <SectionTitle title="تم تسجيل العائلة بنجاح 🎉" subtitle="حسابك جاهز وأطفالك مرتبطون بالحلقة" />
        <ul className="flex flex-col gap-2">
          {done.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-md bg-purple/5 px-3 py-2 ring-1 ring-purple/12">
              <span className="text-body font-bold text-on-dark">{c.displayName}</span>
              <Badge tone="success">مسجّل ومرتبط بالحلقة</Badge>
            </li>
          ))}
        </ul>
        <p className="text-caption text-on-light-muted">
          هذا الجهاز مفعّل لأطفالك (يمكنهم الدخول من مبدّل الأطفال دون حساب).
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/parent" className="flex min-h-11 items-center justify-center rounded-md gradient-cta px-5 text-button font-bold text-cream shadow-glow ring-1 ring-white/15 transition hover:brightness-110">
            فتح لوحة ولي الأمر
          </Link>
          <Link href="/child/switch" className="flex min-h-11 items-center justify-center rounded-md bg-surface-raised px-5 text-button font-bold text-on-dark ring-1 ring-purple/15 transition hover:bg-purple/8">
            فتح تجربة الأطفال
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {hasParentSession ? (
          <p className="text-body text-on-light-muted">
            ستُضاف هذه الأسماء إلى حسابك{parentName ? ` (${parentName})` : ""}.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <SectionTitle title="حساب ولي الأمر" />
            <Field label="اسمك *">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أم عبدالله" required />
            </Field>
            <Field label="البريد الإلكتروني *">
              <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </Field>
            <Field label="كلمة المرور * (8 أحرف على الأقل)">
              <Input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
            </Field>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <SectionTitle title="الأطفال" subtitle={`حتى ${maxKids} ${maxKids === 1 ? "طفل" : "أطفال"} على هذه الدعوة`} />
          {kids.map((kid, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md bg-purple/5 p-3 ring-1 ring-purple/10">
              <Field label={`اسم الطفل ${i + 1} *`}>
                <Input
                  value={kid.displayName}
                  onChange={(e) => setKid(i, { displayName: e.target.value })}
                  placeholder="مثال: عبدالله"
                  required={i === 0}
                />
              </Field>
              <AvatarPicker value={kid.avatar} onChange={(src) => setKid(i, { avatar: src })} />
            </div>
          ))}
          {kids.length < maxKids && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setKids((prev) => [...prev, { displayName: "", avatar: CHILD_AVATARS[0].src }])}
            >
              + إضافة طفل آخر
            </Button>
          )}
        </div>

        {error && <Badge tone="danger">{error}</Badge>}
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? "جاري التسجيل..." : "تسجيل العائلة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
