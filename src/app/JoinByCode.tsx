"use client";

/* Landing · invitation-code entry — «لدي دعوة»: type a code and go to /join. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components";

export function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function go() {
    const c = code.trim();
    router.push(c ? `/join?code=${encodeURIComponent(c)}` : "/join");
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-surface-raised p-4 text-start ring-1 ring-purple/12">
      <span className="text-card-title font-bold text-on-dark">لدي دعوة</span>
      <p className="text-caption text-on-dark-muted">أدخل كود الدعوة الذي أرسله لك المعلم.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="كود الدعوة"
          dir="ltr"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          placeholder="مثال: FAM-XXXX"
          className="bg-surface" // darker cream so the field stands out inside this raised card
        />
        <Button onClick={go} className="shrink-0 sm:w-32">متابعة</Button>
      </div>
    </div>
  );
}
