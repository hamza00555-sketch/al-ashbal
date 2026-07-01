"use client";

/* Teacher access code form (LOCAL DEMO gate — not real auth). On a valid seeded
   code it creates a local teacher session and opens /teacher. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, inputClass, fieldLabel } from "@/components";
import {
  findTeacherByCode,
  setActiveTeacherSession,
} from "@/lib/demo/teacherSession";

export function TeacherLogin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const match = findTeacherByCode(code);
    if (!match) {
      setError("كود المعلم غير صحيح");
      return;
    }
    setError(null);
    setActiveTeacherSession({
      teacherId: match.teacherId,
      displayName: name.trim() || match.displayName,
      accessCode: match.code,
      loggedInAt: new Date().toISOString(),
    });
    router.replace("/teacher");
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-card-title font-bold">دخول المعلم</span>
        <p className="text-caption text-on-dark-muted">أدخل كود المعلم للمتابعة إلى لوحة المعلم.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>كود المعلم *</span>
          <input
            dir="ltr"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); }}
            placeholder="مثال: TCH-XXX"
            className={inputClass}
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>اسمك (اختياري)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: الأستاذ خالد"
            className={inputClass}
          />
        </label>
        {error && <Badge tone="danger">{error}</Badge>}
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth>دخول</Button>
        </div>
      </form>
    </Card>
  );
}
