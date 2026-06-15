"use client";

import { useState } from "react";
import { Badge, Button } from "@/components";

/**
 * Mock recitation review controls. Accept / request re-record / add note —
 * all local state only, nothing uploaded or persisted.
 */
export function ReviewActions() {
  const [decision, setDecision] = useState<"accepted" | "rerecord" | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);

  if (decision) {
    return (
      <div className="flex flex-col gap-2">
        <Badge tone={decision === "accepted" ? "success" : "warning"}>
          {decision === "accepted" ? "تم قبول التسميع تجريبيًا" : "تم طلب إعادة التسميع تجريبيًا"}
        </Badge>
        {savedNote && <p className="text-caption text-on-dark-muted">ملاحظة (تجريبية): {savedNote}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => setDecision("accepted")}>
          قبول التسميع
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDecision("rerecord")}>
          طلب إعادة التسميع
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setNoteOpen((v) => !v)}>
          إضافة ملاحظة
        </Button>
      </div>

      {noteOpen && (
        <div className="flex flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ملاحظة للطفل/ولي الأمر"
            className="min-h-11 rounded-md border border-white/10 bg-surface-raised px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSavedNote(note.trim() || null);
              setNoteOpen(false);
            }}
          >
            حفظ الملاحظة
          </Button>
        </div>
      )}

      {savedNote && <p className="text-caption text-on-dark-muted">ملاحظة (تجريبية): {savedNote}</p>}
      <p className="text-caption text-on-dark-muted">التفاعل تجريبي — لا يُحفظ.</p>
    </div>
  );
}
