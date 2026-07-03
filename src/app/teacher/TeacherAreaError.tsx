"use client";

/*
  Shown when the SERVER could not resolve the teacher auth state (env/network/DB
  failure) — a clear Arabic screen instead of a silent blank page.
*/
import { Button, Card } from "@/components";

export function TeacherAreaError() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-5 pt-[14vh] pb-10">
      <Card className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <span className="text-h2 text-on-dark">تعذّر تحميل لوحة المعلم</span>
        <p className="text-body text-on-light-muted">
          حدث خطأ مؤقت أثناء التحقق من الجلسة. حدّث الصفحة، وإن تكرر الخطأ حاول الدخول من جديد.
        </p>
        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={() => window.location.reload()}>
            تحديث الصفحة
          </Button>
          <Button variant="secondary" fullWidth onClick={() => window.location.assign("/login")}>
            العودة لصفحة الدخول
          </Button>
        </div>
      </Card>
    </main>
  );
}
