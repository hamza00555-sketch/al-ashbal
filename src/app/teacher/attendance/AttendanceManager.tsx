"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card } from "@/components";
import { cn } from "@/lib/cn";
import {
  summarize,
  useAttendance,
  type AttendanceStatus,
} from "@/lib/demo/attendance";

const STATUS_META: Record<AttendanceStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  present: { label: "حاضر", tone: "success" },
  late: { label: "متأخر", tone: "warning" },
  absent: { label: "غائب", tone: "danger" },
  not_joined: { label: "لم يدخل بعد", tone: "neutral" },
};

const OVERRIDES: { id: Exclude<AttendanceStatus, "not_joined">; label: string }[] = [
  { id: "present", label: "حاضر" },
  { id: "late", label: "متأخر" },
  { id: "absent", label: "غائب" },
];

function formatTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

export interface AttendanceChild {
  id: string;
  name: string;
}

export function AttendanceManager({
  lessonId,
  childrenList,
  teacherId,
  teacherName,
}: {
  lessonId: string;
  childrenList: AttendanceChild[];
  teacherId: string;
  teacherName: string;
}) {
  const ids = childrenList.map((c) => c.id);
  const { state, openGate, closeGate, setManual } = useAttendance(lessonId, ids);
  const summary = summarize(state, ids);
  const { gate } = state;

  const [meetUrl, setMeetUrl] = useState("");
  const [teacherMessage, setTeacherMessage] = useState<string | null>(null);

  function handleOpen() {
    openGate({ meetUrl: meetUrl.trim() || undefined, teacherId, teacherName });
  }

  function joinAsTeacher() {
    const url = gate.meetUrl;
    if (url && /^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      setTeacherMessage("يُفتح رابط الحلقة في تبويب جديد (دخولك لا يُسجّل حضورًا).");
    } else {
      setTeacherMessage("لا يوجد رابط للحلقة الآن.");
    }
  }

  const overrideBtn = (childId: string, current: AttendanceStatus) =>
    OVERRIDES.map((opt) => (
      <button
        key={opt.id}
        type="button"
        aria-pressed={current === opt.id}
        onClick={() => setManual(childId, opt.id)}
        className={cn(
          "rounded-pill px-3 py-1 text-caption font-bold transition",
          current === opt.id ? "gradient-cta text-cream" : "bg-surface-raised text-on-dark-muted hover:text-on-dark",
        )}
      >
        {opt.label}
      </button>
    ));

  const th = "p-4 text-start text-caption font-bold text-on-dark-muted whitespace-nowrap";
  const td = "p-4 align-middle";

  return (
    <div className="flex flex-col gap-6">
      {/* Gate card */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-on-dark-muted">بوابة الحضور</span>
            <span className="text-card-title font-bold">
              الحالة: {gate.status === "open" ? "مفتوحة" : gate.status === "closed" ? "مغلقة" : "غير مفتوحة"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleOpen} disabled={gate.status === "open"}>
              فتح البوابة
            </Button>
            <Button variant="danger" size="sm" onClick={closeGate} disabled={gate.status !== "open"}>
              إغلاق البوابة
            </Button>
          </div>
        </div>

        {/* Lesson meet link */}
        <label className="flex flex-col gap-2">
          <span className="text-caption text-on-dark-muted">رابط الحلقة</span>
          <input
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            inputMode="url"
            placeholder="ضع رابط Google Meet الخاص بك"
            disabled={gate.status === "open"}
            className="min-h-11 rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft disabled:opacity-60"
          />
          {gate.status !== "open" && meetUrl.trim() === "" && (
            <span className="text-caption text-on-dark-muted">
              يمكن فتح البوابة بدون رابط، لكن زر «دخول الدرس» لن يفتح Google Meet.
            </span>
          )}
        </label>

        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">فترة السماح: {gate.graceMinutes} دقائق</Badge>
          <Badge tone="purple">وقت الفتح: {formatTime(gate.openedAt)}</Badge>
          <Badge tone="purple">وقت الإغلاق: {formatTime(gate.closedAt)}</Badge>
        </div>

        {/* Active gate info + teacher entry */}
        {gate.status === "open" && (
          <div className="flex flex-col gap-3 rounded-md bg-surface-raised p-4">
            <div className="flex flex-wrap items-center gap-2 text-caption text-on-dark-muted">
              <span>فتحها: <span className="font-bold text-on-dark">{gate.teacherName ?? "—"}</span></span>
              <span className="break-all">رابط الحلقة: {gate.meetUrl ?? "—"}</span>
            </div>
            <div>
              <Button variant="secondary" size="sm" onClick={joinAsTeacher}>دخول الدرس كمعلم</Button>
            </div>
            {teacherMessage && <p className="text-caption text-on-dark-muted">{teacherMessage}</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge tone="success">حاضر {summary.present}</Badge>
          <Badge tone="warning">متأخر {summary.late}</Badge>
          <Badge tone="danger">غائب {summary.absent}</Badge>
          {summary.notJoined > 0 && <Badge tone="neutral">لم يدخل {summary.notJoined}</Badge>}
          <Badge tone="gold">نسبة الحضور التجريبية {summary.scorePercent}%</Badge>
        </div>

        <p className="text-caption text-on-dark-muted">
          الأساس أن الطفل يدخل عبر بوابة التطبيق. التعديل اليدوي للطوارئ فقط، ودخول المعلم
          لا يُسجّل حضورًا. النسبة تجريبية — لا شيء محفوظ في قاعدة بيانات.
        </p>
      </Card>

      {/* Mobile: cards (no horizontal scroll) */}
      <div className="flex flex-col gap-3 md:hidden">
        {childrenList.map((child) => {
          const entry = state.entries[child.id];
          const status = entry?.status ?? "not_joined";
          return (
            <Card key={child.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={child.name} size="sm" />
                  <span className="truncate font-bold">{child.name}</span>
                </span>
                <Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-caption text-on-dark-muted">
                <span>وقت الدخول: {formatTime(entry?.joinedAt)}</span>
                {entry?.manual ? (
                  <Badge tone="neutral">تعديل يدوي</Badge>
                ) : (
                  status !== "not_joined" && <Badge tone="neutral">تلقائي</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">{overrideBtn(child.id, status)}</div>
            </Card>
          );
        })}
      </div>

      {/* Desktop: table */}
      <Card padded={false} className="hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-body">
            <thead>
              <tr className="border-b border-white/10">
                <th className={th}>الطفل</th>
                <th className={th}>الحالة</th>
                <th className={th}>وقت الدخول</th>
                <th className={th}>المصدر</th>
                <th className={th}>تعديل يدوي</th>
              </tr>
            </thead>
            <tbody>
              {childrenList.map((child) => {
                const entry = state.entries[child.id];
                const status = entry?.status ?? "not_joined";
                return (
                  <tr key={child.id} className="border-b border-white/5 last:border-0">
                    <td className={td}>
                      <span className="flex items-center gap-3">
                        <Avatar name={child.name} size="sm" />
                        <span className="font-bold">{child.name}</span>
                      </span>
                    </td>
                    <td className={td}>
                      <Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
                    </td>
                    <td className={cn(td, "whitespace-nowrap")}>{formatTime(entry?.joinedAt)}</td>
                    <td className={td}>
                      {entry?.manual ? (
                        <Badge tone="neutral">تعديل يدوي</Badge>
                      ) : status !== "not_joined" ? (
                        <span className="text-on-dark-muted">تلقائي</span>
                      ) : (
                        <span className="text-on-dark-muted">—</span>
                      )}
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-2">{overrideBtn(child.id, status)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
