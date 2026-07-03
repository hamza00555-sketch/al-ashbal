"use client";

/* Supabase-backed FAMILY invitations manager (Phase 2).
   Creation/revocation happen in server actions; this component only renders
   and collects input. Links are portable: /join?code=FAM-XXXXXXXX validates
   against the database on any device. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, Input, Select, Modal, SectionTitle, EmptyState } from "@/components";
import type { Invitation } from "@/lib/supabase/types";
import { createFamilyInvitationAction, revokeInvitationAction } from "./actions";

type Status = "active" | "expired" | "revoked";

function statusOf(inv: Invitation): Status {
  if (inv.revoked_at) return "revoked";
  if (inv.expires_at && Date.parse(inv.expires_at) < Date.now()) return "expired";
  return "active";
}

const STATUS_LABEL: Record<Status, { label: string; tone: "success" | "warning" | "danger" }> = {
  active: { label: "نشطة", tone: "success" },
  expired: { label: "منتهية", tone: "warning" },
  revoked: { label: "موقوفة", tone: "danger" },
};

function linkFor(inv: Invitation): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/join?code=${inv.code}`;
}
function familyMsg(link: string) {
  return `أهلًا، هذه دعوة تسجيل عائلتكم في تطبيق الأشبال. افتحوا الرابط وسجلوا ولي الأمر والأطفال: ${link}`;
}
function formatExpiry(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("ar", { day: "numeric", month: "long" });
}

function ResultCard({ inv }: { inv: Invitation }) {
  const link = linkFor(inv);
  const msg = familyMsg(link);
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`تم نسخ ${what}.`);
    } catch {
      setCopied("تعذّر النسخ — انسخه يدويًا.");
    }
  }
  return (
    <div className="flex flex-col gap-2 rounded-md bg-purple/5 p-3 ring-1 ring-purple/12">
      <div className="flex flex-wrap items-center gap-2">
        <span dir="ltr" className="rounded-md bg-surface-raised px-4 py-2 text-h2 font-extrabold tracking-widest text-purple ring-1 ring-purple/15">{inv.code}</span>
        <Badge tone="purple">دعوة عائلة</Badge>
      </div>
      <span dir="ltr" className="break-all text-caption text-on-light-muted">{link}</span>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => copy(link, "الرابط")}>نسخ الرابط</Button>
        <Button variant="secondary" size="sm" onClick={() => copy(msg, "رسالة واتساب")}>نسخ رسالة واتساب</Button>
      </div>
      {copied && <span className="text-caption text-mint">{copied}</span>}
    </div>
  );
}

export function BackendInvitationsManager({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [maxChildren, setMaxChildren] = useState("2");
  const [days, setDays] = useState("7");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Invitation | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);
  const [rowMsg, setRowMsg] = useState<string | null>(null);

  async function create() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await createFamilyInvitationAction({
      label,
      maxChildren: Number(maxChildren),
      expiresDays: days.trim() ? Number(days) : 7,
    });
    if (res.ok) {
      setResult(res.invitation);
      setLabel("");
    } else {
      setError(res.message);
    }
    setBusy(false);
    router.refresh();
  }

  async function revoke(inv: Invitation) {
    setRevokeTarget(null);
    const res = await revokeInvitationAction(inv.id);
    if (!res.ok) setRowMsg(res.message ?? null);
    router.refresh();
  }

  async function copyRowLink(inv: Invitation) {
    try {
      await navigator.clipboard.writeText(linkFor(inv));
      setRowMsg("تم نسخ الرابط.");
    } catch {
      setRowMsg("تعذّر النسخ — انسخه يدويًا.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <SectionTitle title="إنشاء دعوة عائلة" subtitle="ولي الأمر يفتح الرابط، ينشئ حسابه، ويضيف أطفاله — تصل مباشرة لحلقتك" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم العائلة (اختياري)" className="sm:col-span-2">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: عائلة عبدالله" />
          </Field>
          <Field label="عدد الأطفال المسموح">
            <Select value={maxChildren} onChange={(e) => setMaxChildren(e.target.value)}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
          <Field label="صلاحية الدعوة (أيام)">
            <Input type="number" min={1} max={60} value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
        </div>
        {error && <Badge tone="danger">{error}</Badge>}
        <div className="sm:max-w-xs">
          <Button variant="primary" fullWidth onClick={create} disabled={busy}>
            {busy ? "جاري الإنشاء..." : "إنشاء الدعوة"}
          </Button>
        </div>
        {result && <ResultCard inv={result} />}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionTitle title="الدعوات الحالية" subtitle="محفوظة في قاعدة البيانات — تعمل من أي جهاز" />
        {rowMsg && <span className="text-caption text-mint">{rowMsg}</span>}
        {invitations.length === 0 ? (
          <EmptyState title="لا دعوات بعد" hint="أنشئ أول دعوة عائلة من النموذج أعلاه." />
        ) : (
          <ul className="flex flex-col gap-2">
            {invitations.map((inv) => {
              const st = statusOf(inv);
              const expiry = formatExpiry(inv.expires_at);
              return (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-raised px-3 py-2 ring-1 ring-purple/10">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span dir="ltr" className="font-bold tracking-wider text-purple">{inv.code}</span>
                    {inv.label && <span className="text-caption text-on-light-muted">{inv.label}</span>}
                    <Badge tone={STATUS_LABEL[st].tone}>{STATUS_LABEL[st].label}</Badge>
                    <span className="text-caption text-on-light-muted">
                      الأطفال: {inv.used_children_count}/{inv.max_children}
                      {expiry ? ` · تنتهي ${expiry}` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => copyRowLink(inv)}>نسخ الرابط</Button>
                    {st === "active" && (
                      <Button variant="secondary" size="sm" onClick={() => setRevokeTarget(inv)}>إيقاف</Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {revokeTarget && (
        <Modal open title="تأكيد إيقاف الدعوة" onClose={() => setRevokeTarget(null)}>
          <div className="flex flex-col gap-3">
            <p className="text-body text-on-light-muted">
              سيتم إيقاف الدعوة <span dir="ltr" className="font-bold">{revokeTarget.code}</span> نهائيًا ولن يستطيع أحد استخدامها.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => revoke(revokeTarget)}>إيقاف الدعوة</Button>
              <Button variant="secondary" size="sm" onClick={() => setRevokeTarget(null)}>إلغاء</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
