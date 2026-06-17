"use client";

import { useState } from "react";
import { AppAssetIcon, Badge, Button } from "@/components";
import { useAttendance } from "@/lib/demo/attendance";
import { IconBook } from "../_icons";

const GATE_CLOSED_MESSAGE = "بوابة الحضور مغلقة حاليًا، لن يتم تسجيل أي حضور الآن.";

/**
 * Child join flow (mock). Attendance is recorded ONLY when the teacher's gate
 * is open. If the gate is closed (or never opened), pressing the button shows a
 * clear notice and records nothing — no store write, no timestamp, no success.
 * - gate open  → record join → present (within grace) / late → open gate.meetUrl
 * - gate closed / idle → blocked with a clear message (no attendance)
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
  const gateOpen = state.gate.status === "open";

  function handleJoin() {
    if (!lessonId) {
      setMessage("لا يوجد درس الآن.");
      return;
    }
    // ── Attendance gate guard ──────────────────────────────────────────────
    // Block EVERYTHING (store write / timestamp / success) unless the gate is
    // open. This runs before recordJoin, which also re-checks the gate itself.
    if (state.gate.status !== "open") {
      setMessage(GATE_CLOSED_MESSAGE);
      return;
    }
    const result = recordJoin(childId);
    if (!result.ok) {
      // Gate flipped to closed between render and click — still nothing saved.
      setMessage(GATE_CLOSED_MESSAGE);
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
      {/* Clear gate status when there is a lesson but the gate is not open. */}
      {lessonId && !gateOpen && (
        <div className="flex flex-col gap-1 rounded-md bg-surface-raised px-4 py-3">
          <span>
            <Badge tone="warning">بوابة الحضور مغلقة</Badge>
          </span>
          <p className="text-caption text-on-dark-muted">
            يفتحها المعلم عند بداية الحلقة. لن يُسجَّل أي حضور الآن.
          </p>
        </div>
      )}

      <Button
        variant="primary"
        fullWidth
        disabled={disabled}
        onClick={handleJoin}
        leadingIcon={<AppAssetIcon src="/assets/icons/icon_lessons.png" size="sm" fallback={<IconBook />} />}
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
