"use client";

/* Landing · invitation-code entry — «لدي دعوة»: type a code and go to /join. */
import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function go() {
    const c = code.trim();
    router.push(c ? `/join?code=${encodeURIComponent(c)}` : "/join");
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-surface-raised p-4 text-right ring-1 ring-purple/12">
      <span className="text-card-title font-bold text-on-dark">لدي دعوة</span>
      <p className="text-caption text-on-dark-muted">أدخل كود الدعوة الذي أرسله لك المعلم.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          placeholder="مثال: FAM-XXXX"
          className="min-h-11 w-full rounded-md border border-purple/12 bg-surface px-4 text-body text-on-dark outline-none transition focus:border-purple-soft"
        />
        <button
          type="button"
          onClick={go}
          className="min-h-11 shrink-0 rounded-md bg-purple px-6 text-button font-bold text-cream ring-1 ring-white/15 transition hover:brightness-110 sm:w-32"
        >
          متابعة
        </button>
      </div>
    </div>
  );
}
