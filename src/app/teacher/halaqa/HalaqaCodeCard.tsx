"use client";

import { useState } from "react";
import { Badge, Button, Card, SectionTitle } from "@/components";
import { regenerateHalaqaCode, useHalaqaCode } from "@/lib/demo/halaqaEnrollment";

/**
 * Teacher halaqa invite code — show / copy / regenerate. Local demo only:
 * sharing the code lets a parent enroll a child from /parent/link-child.
 */
export function HalaqaCodeCard({ halaqaId, halaqaName }: { halaqaId: string; halaqaName: string }) {
  const code = useHalaqaCode(halaqaId);
  const [message, setMessage] = useState<string | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("تم نسخ الكود.");
    } catch {
      setMessage("تعذّر النسخ — انسخه يدويًا.");
    }
  }

  function regenerate() {
    regenerateHalaqaCode(halaqaId);
    setMessage("تم تجديد الكود. الكود القديم لم يعد صالحًا.");
  }

  return (
    <Card variant="plum" className="flex flex-col gap-4">
      <SectionTitle title="كود الحلقة" subtitle={`${halaqaName} — شاركه مع أولياء الأمور للانضمام`} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-surface-raised px-5 py-3 text-h2 font-extrabold tracking-widest text-on-dark ring-1 ring-purple-soft/30">
          {code}
        </span>
        <Badge tone="purple" onAccent>تجريبي — محلي</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={copy}>نسخ الكود</Button>
        <Button variant="ghost" size="sm" className="text-cream/80 hover:bg-white/10 hover:text-cream" onClick={regenerate}>تجديد الكود</Button>
      </div>
      {message && <p className="text-caption text-cream/70">{message}</p>}
      <p className="text-caption text-cream/70">
        ولي الأمر يُدخل هذا الكود في «ربط طفل بالحَلَقة» ثم يختار طفله. لا ينضم أي طفل تلقائيًا.
      </p>
    </Card>
  );
}
