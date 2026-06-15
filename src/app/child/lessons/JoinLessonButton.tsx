"use client";

import { useState } from "react";
import { Button } from "@/components";
import { IconBook } from "../_icons";

/**
 * Mock "join lesson" action. If the lesson has a real (http) meet link it opens
 * in a new tab; otherwise it shows a clear demo message. No Meet integration.
 */
export function JoinLessonButton({
  meetUrl,
  disabled = false,
}: {
  meetUrl?: string;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);

  function handleJoin() {
    if (meetUrl && /^https?:\/\//.test(meetUrl)) {
      window.open(meetUrl, "_blank", "noopener,noreferrer");
      setMessage("يُفتح رابط الدرس التجريبي في تبويب جديد.");
    } else {
      setMessage("رابط الدرس التجريبي غير مفعّل الآن.");
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
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
    </div>
  );
}
