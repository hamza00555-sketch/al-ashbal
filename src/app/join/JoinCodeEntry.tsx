"use client";

/* Manual invitation-code entry (when /join is opened without ?code). */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input } from "@/components";

export function JoinCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setBusy(true);
    router.push(`/join?code=${encodeURIComponent(clean)}`);
  }

  return (
    <Card className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="كود الدعوة *">
          <Input
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FAM-XXXXXXXX"
            required
            autoFocus
          />
        </Field>
        <div className="sm:max-w-xs">
          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? "جاري التحقق..." : "متابعة"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
