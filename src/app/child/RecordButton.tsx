"use client";

import { useState } from "react";
import { Button } from "@/components";
import { IconMic } from "./_icons";

/** Mock recitation recording trigger — shows a clear demo message, no upload. */
export function RecordButton() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondary"
        fullWidth
        onClick={() => setMessage("التسجيل تجريبي — غير مفعّل الآن.")}
        leadingIcon={<span className="inline-flex size-5"><IconMic /></span>}
      >
        سجّل تسميعك
      </Button>
      {message && <p className="text-caption text-on-dark-muted">{message}</p>}
    </div>
  );
}
