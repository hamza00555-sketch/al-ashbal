"use client";

import { useState } from "react";
import { Button } from "@/components";
import type { ChildTaskStatus, ChildTaskType } from "@/types";

const VIEW_STATUSES: ChildTaskStatus[] = [
  "submitted",
  "pending_parent_approval",
  "pending_teacher_review",
  "accepted",
];

/**
 * Mock task action. The label depends on the task state; clicking shows a clear
 * demo message. Real recording/execution is intentionally deferred.
 */
export function TaskActionButton({
  type,
  status,
  statusLabel,
}: {
  type: ChildTaskType;
  status: ChildTaskStatus;
  statusLabel: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const mode = VIEW_STATUSES.includes(status)
    ? "view"
    : type === "recitation"
      ? "record"
      : "start";
  const label = mode === "view" ? "عرض النتيجة" : mode === "record" ? "سجّل التسميع" : "ابدأ المهمة";

  function handleClick() {
    if (mode === "record") setMessage("سيتم تفعيل تسجيل الصوت والفيديو في خطوة لاحقة.");
    else if (mode === "start") setMessage("سيتم تفعيل تنفيذ المهمة في خطوة لاحقة.");
    else setMessage(`النتيجة تجريبية — الحالة: ${statusLabel}.`);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="sm:max-w-xs">
        <Button variant={mode === "view" ? "secondary" : "primary"} size="sm" fullWidth onClick={handleClick}>
          {label}
        </Button>
      </div>
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
    </div>
  );
}
