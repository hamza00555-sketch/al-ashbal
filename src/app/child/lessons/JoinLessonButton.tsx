"use client";

import { useState } from "react";
import { Badge, Button } from "@/components";
import { useAttendance } from "@/lib/demo/attendance";
import { IconBook } from "../_icons";

/**
 * Child join flow (mock). Uses the OPEN gate's meet link (set by the teacher),
 * not a static lesson URL.
 * - gate open  → record join → present (within grace) / late → open gate.meetUrl
 * - gate closed / not opened → blocked with a clear message (no attendance)
 */
export function JoinLessonButton({
  lessonId,
  childId,
  disabled = false,
}: {
  lessonId?: string;
  childId: string;
  disabled?: boolean;
}) {
  const { state, recordJoin } = useAttendance(lessonId ?? "none", [childId]);
  const [message, setMessage] = useState<string | null>(null);
  const myStatus = state.entries[childId]?.status;

  function handleJoin() {
    if (!lessonId) {
      setMessage("لا يوجد درس الآن.");
      return;
    }
    if (state.gate.status === "idle") {
      setMessage("لم يفتح المعلم بوابة الحضور بعد.");
      return;
    }
    if (state.gate.status === "closed") {
      setMessage("بوابة الحضور مغلقة الآن.");
      return;
    }
    const result = recordJoin(childId);
    if (!result.ok) {
      setMessage("تعذّر تسجيل الدخول الآن.");
      return;
    }
    const label = result.status === "present" ? "حاضر" : "متأخر";
    const meetUrl = state.gate.meetUrl;
    if (meetUrl && /^https?:\/\//.test(meetUrl)) {
      window.open(meetUrl, "_blank", "noopener,noreferrer");
      setMessage(`تم تسجيل حضورك تجريبيًا: ${label} — يُفتح رابط الدرس في تبويب جديد.`);
    } else {
      setMessage(`تم تسجيل حضورك تجريبيًا: ${label}، لكن رابط الدرس غير مفعّل الآن.`);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="primary"
        fullWidth
        disabled={disabled}
        onClick={handleJoin}
        leadingIcon={<span className="inline-flex size-5"><IconBook /></span>}
      >
        ادخل الدرس
      </Button>

      {myStatus && myStatus !== "not_joined" && (
        <span>
          <Badge tone={myStatus === "present" ? "success" : myStatus === "late" ? "warning" : "danger"}>
            {myStatus === "present" ? "حاضر" : myStatus === "late" ? "متأخر" : "غائب"}
          </Badge>
        </span>
      )}
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
      <p className="text-caption text-on-dark-muted">الحضور تجريبي وغير محفوظ في قاعدة بيانات.</p>
    </div>
  );
}
