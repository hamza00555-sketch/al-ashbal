"use client";

import { useState } from "react";
import { Badge, Button, Modal } from "@/components";
import { cn } from "@/lib/cn";
import { pushNotification } from "@/lib/demo/notifications";
import { addPoints, POINT_PRESETS } from "@/lib/demo/points";

export interface AddPointsTarget {
  childId: string;
  childName: string;
  childUserId: string;
  parentUserIds: string[];
  halaqaId: string;
  teacherId: string;
  teacherName: string;
}

/** Quick "add points" trigger + sheet. Reused on the children list and detail. */
export function AddPointsButton({
  target,
  size = "sm",
  variant = "secondary",
  fullWidth,
}: {
  target: AddPointsTarget;
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function reset() {
    setSelected(null);
    setNote("");
  }

  function save() {
    if (selected === null) {
      setMessage("اختر نوع النقاط أولًا.");
      return;
    }
    const preset = POINT_PRESETS[selected];
    addPoints({
      childId: target.childId,
      teacherId: target.teacherId,
      teacherName: target.teacherName,
      halaqaId: target.halaqaId,
      value: preset.value,
      reason: preset.reason,
      category: preset.category,
      note: note.trim() || undefined,
    });
    if (target.childUserId) {
      pushNotification({
        userId: target.childUserId,
        title: "حصلت على نقاط جديدة",
        body: preset.reason,
        type: "points",
        href: "/child/progress",
      });
    }
    for (const parentId of target.parentUserIds) {
      if (!parentId) continue;
      pushNotification({
        userId: parentId,
        title: "تمت إضافة نقاط لطفلك",
        body: `${target.childName}: ${preset.reason}`,
        type: "points",
        href: `/parent/children/${target.childId}`,
      });
    }
    reset();
    setOpen(false);
    setMessage("تمت إضافة النقاط تجريبيًا.");
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={() => {
          setMessage(null);
          setOpen(true);
        }}
      >
        إضافة نقاط
      </Button>
      {message && !open && <p className="mt-1 text-caption text-mint">{message}</p>}

      {open && (
        <Modal open onClose={() => setOpen(false)} title={`نقاط ${target.childName}`}>
          <div className="flex flex-col gap-4">
            <p className="text-caption text-on-dark-muted">اختر تقييمًا سريعًا:</p>
            <div className="flex flex-col gap-2">
              {POINT_PRESETS.map((preset, i) => {
                const active = selected === i;
                const negative = preset.value < 0;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border px-4 text-start text-body font-bold transition",
                      active
                        ? negative
                          ? "border-coral bg-coral/15 text-on-dark"
                          : "border-purple-soft bg-purple/15 text-on-dark"
                        : "border-purple/12 bg-surface-raised text-on-dark-muted hover:text-on-dark",
                    )}
                  >
                    <span>{preset.label}</span>
                    <Badge tone={negative ? "danger" : "purple"}>{negative ? preset.value : `+${preset.value}`}</Badge>
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-caption text-on-dark-muted">ملاحظة (اختياري)</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: شارك بفاعلية في الحلقة"
                className="min-h-11 w-full rounded-md border border-purple/12 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
              />
            </label>

            {message && open && <Badge tone="danger">{message}</Badge>}

            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={save}>حفظ النقاط</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            </div>
            <p className="text-caption text-on-dark-muted">تجريبي — يُحفظ على هذا الجهاز فقط.</p>
          </div>
        </Modal>
      )}
    </>
  );
}
