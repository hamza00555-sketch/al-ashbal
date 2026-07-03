"use client";

/* Public join-request form — creates a PENDING request only (no access). */
import { useState } from "react";
import { Badge, Button, Card, Field, Input } from "@/components";
import type { JoinRequestRole } from "@/lib/supabase/types";
import { submitJoinRequestAction } from "./actions";

const ROLE_OPTIONS: { value: JoinRequestRole; label: string }[] = [
  { value: "teacher", label: "معلم" },
  { value: "parent", label: "ولي أمر" },
];

export function JoinRequestForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<JoinRequestRole>("parent");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitJoinRequestAction({
        displayName,
        email,
        password,
        requestedRole: role,
        note,
      });
      if (result.ok) {
        setDone(true);
        return;
      }
      setError(
        result.reason === "already_pending"
          ? "لديك طلب سابق قيد المراجعة."
          : result.reason === "already_member"
            ? "هذا البريد مسجّل بالفعل — جرّب تسجيل الدخول."
            : result.reason === "invalid"
              ? "تأكد من الاسم والبريد الإلكتروني وكلمة مرور (8 أحرف على الأقل)."
              : "تعذّر إرسال الطلب. حاول مرة أخرى.",
      );
    } catch {
      setError("تعذّر إرسال الطلب. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-2 text-center">
        <span className="text-card-title font-bold text-mint">تم إرسال طلبك بنجاح. سنراجع الطلب قريبًا.</span>
        <p className="text-caption text-on-dark-muted">
          بعد الموافقة يمكنك تسجيل الدخول بنفس البريد وكلمة المرور.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="الاسم *">
          <Input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setError(null); }}
            placeholder="مثال: الأستاذة أسماء"
            required
            autoFocus
          />
        </Field>
        <Field label="البريد الإلكتروني *">
          <Input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="email"
            required
          />
        </Field>
        <Field label="كلمة المرور * (8 أحرف على الأقل — ستستخدمها للدخول بعد الموافقة)">
          <Input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-caption text-on-dark-muted">نوع الطلب *</legend>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-body transition ${
                  role === opt.value
                    ? "border-purple-soft bg-purple/15 font-bold text-on-dark"
                    : "border-purple/12 bg-surface-raised text-on-dark-muted"
                }`}
              >
                <input
                  type="radio"
                  name="requestedRole"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={() => setRole(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="ملاحظة (اختياري)">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثال: ولي أمر لطفلين في الحلقة"
          />
        </Field>
        {error && <Badge tone="danger">{error}</Badge>}
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
