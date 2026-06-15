"use client";

import { useState } from "react";
import { Button, Card } from "@/components";
import { useOpenGate } from "@/lib/demo/attendance";
import { IconHalaqa } from "./_icons";

/**
 * Guest lesson entry (mock). Follows whichever attendance gate the teacher
 * opened in this browser and opens its meet link in a new tab. The guest is
 * NEVER recorded in attendance and sees no child data.
 */
export function GuestLessonEntry() {
  const openGate = useOpenGate();
  const [message, setMessage] = useState<string | null>(null);

  function handleEnter() {
    if (!openGate) {
      setMessage("لم يفتح المعلم بوابة الدرس بعد.");
      return;
    }
    const url = openGate.meetUrl;
    if (url && /^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      setMessage("يُفتح رابط الدرس في تبويب جديد (دخول الضيف لا يُسجّل حضورًا).");
    } else {
      setMessage("رابط الدرس التجريبي غير مفعّل الآن.");
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple-soft">
          <IconHalaqa />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-card-title font-bold">دخول الدرس كضيف</span>
          <span className="text-caption text-on-dark-muted">
            يمكن لضيف الشرف حضور الدرس دون الوصول إلى بيانات الأطفال الشخصية.
          </span>
        </div>
      </div>
      <div className="lg:max-w-xs">
        <Button variant="primary" fullWidth onClick={handleEnter}>ادخل الدرس</Button>
      </div>
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
    </Card>
  );
}
