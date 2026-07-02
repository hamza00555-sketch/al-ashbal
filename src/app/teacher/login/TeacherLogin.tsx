"use client";

/* Teacher sign-in form (Phase 2 — real Supabase Auth, email + password).
   No public signup: teacher accounts are created with scripts/bootstrap-teacher.mjs.
   On success the session lives in auth cookies; the server (proxy + layout)
   authorizes every /teacher request from then on. */
import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Input } from "@/components";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearLegacyTeacherSession } from "@/lib/demo/legacyTeacherSession";

export function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The old demo gate (TCH- codes) is retired — wipe any leftover localStorage
  // session so it can never be mistaken for a login.
  useEffect(() => {
    clearLegacyTeacherSession();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        // 400 = bad credentials; anything else is a connectivity/server problem.
        setError(
          signInError.status === 400
            ? "بيانات الدخول غير صحيحة"
            : "تعذّر الاتصال بالخادم. حاول مرة أخرى.",
        );
        setBusy(false);
        return;
      }
      clearLegacyTeacherSession();
      // FULL navigation (not router.replace): guarantees the server re-reads
      // the fresh auth cookies with no stale client router cache in the way.
      window.location.assign("/teacher");
    } catch {
      setError("تعذّر الاتصال بالخادم. حاول مرة أخرى.");
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-card-title font-bold">دخول المعلم</span>
        <p className="text-caption text-on-dark-muted">
          أدخل البريد الإلكتروني وكلمة المرور للمتابعة إلى لوحة المعلم.
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
