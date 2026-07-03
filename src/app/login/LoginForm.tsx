"use client";

/* Unified sign-in form (email + password, Supabase Auth) for ALL approved
   roles. After sign-in the SERVER resolves the role and the form navigates:
   teacher → /teacher, parent → /parent; pending/rejected/no-profile users get
   a clear Arabic status instead (and are signed out again). */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Field, Input } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";
import { resolveLoginDestination } from "./actions";

type Notice = { title: string; body: string; showJoinLink?: boolean };

const NOTICES: Record<"pending" | "rejected" | "none", Notice> = {
  pending: {
    title: "طلبك قيد المراجعة",
    body: "طلبك قيد المراجعة. ستتمكن من الدخول بعد الموافقة.",
  },
  rejected: {
    title: "تم رفض طلبك",
    body: "تم رفض طلبك. تواصل مع المسؤول إذا كنت تعتقد أن هناك خطأ.",
  },
  none: {
    title: "الحساب غير مفعّل",
    body: "لم يتم تفعيل حسابك بعد. أرسل طلب انضمام أولًا.",
    showJoinLink: true,
  },
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // The retired demo teacher gate must never linger on this device.
  useEffect(() => {
    clearLegacyTeacherSession();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(
          signInError.status === 400
            ? "بيانات الدخول غير صحيحة"
            : "تعذّر الاتصال بالخادم. حاول مرة أخرى.",
        );
        setBusy(false);
        return;
      }
      clearLegacyTeacherSession();

      const destination = await resolveLoginDestination();
      if (destination.kind === "teacher") {
        window.location.assign("/teacher");
        return;
      }
      if (destination.kind === "parent") {
        window.location.assign("/parent");
        return;
      }
      if (destination.kind === "error") {
        setError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
        setBusy(false);
        return;
      }
      // pending / rejected / none: show the status and end the session again
      // (nothing in the app is accessible for these accounts yet).
      setNotice(NOTICES[destination.kind]);
      setBusy(false);
      supabase.auth.signOut().catch(() => {});
    } catch {
      setError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
      setBusy(false);
    }
  }

  if (notice) {
    return (
      <Card className="flex flex-col items-center gap-3 text-center">
        <span className="text-card-title font-bold text-on-dark">{notice.title}</span>
        <p className="text-body text-on-dark-muted">{notice.body}</p>
        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          {notice.showJoinLink && (
            <Link
              href="/join/request"
              className="flex min-h-11 w-full items-center justify-center rounded-md gradient-cta px-5 text-button font-bold text-cream shadow-glow ring-1 ring-white/15 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-soft"
            >
              إرسال طلب انضمام
            </Link>
          )}
          <Button variant="secondary" fullWidth onClick={() => setNotice(null)}>
            العودة لتسجيل الدخول
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-card-title font-bold">تسجيل الدخول</span>
        <p className="text-caption text-on-dark-muted">
          أدخل البريد الإلكتروني وكلمة المرور — سنفتح لك لوحتك حسب حسابك.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="البريد الإلكتروني *">
          <Input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="email"
            required
            autoFocus
          />
        </Field>
        <Field label="كلمة المرور *">
          <Input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            autoComplete="current-password"
            required
          />
        </Field>
        {error && <Badge tone="danger">{error}</Badge>}
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? "جاري الدخول..." : "دخول"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
