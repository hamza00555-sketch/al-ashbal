"use client";

/* Review list for join requests — approve/reject with confirmation. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, Modal } from "@/components";
import type { JoinRequest } from "@/lib/supabase/types";
import { approveJoinRequestAction, rejectJoinRequestAction } from "./actions";

const STATUS_LABEL: Record<JoinRequest["status"], { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = {
  pending: { label: "قيد المراجعة", tone: "warning" },
  approved: { label: "مقبول", tone: "success" },
  rejected: { label: "مرفوض", tone: "danger" },
  cancelled: { label: "ملغي", tone: "neutral" },
};

const ROLE_LABEL: Record<JoinRequest["requested_role"], string> = {
  teacher: "معلم",
  parent: "ولي أمر",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("ar", { day: "numeric", month: "long", year: "numeric" });
}

export function JoinRequestsList({ requests }: { requests: JoinRequest[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ request: JoinRequest; action: "approve" | "reject" } | null>(null);

  async function run(request: JoinRequest, action: "approve" | "reject") {
    setConfirm(null);
    setBusyId(request.id);
    setError(null);
    const result =
      action === "approve"
        ? await approveJoinRequestAction(request.id)
        : await rejectJoinRequestAction(request.id);
    if (!result.ok) setError(result.message);
    setBusyId(null);
    router.refresh();
  }

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="flex flex-col gap-4">
      {error && <Badge tone="danger">{error}</Badge>}

      {pending.length === 0 ? (
        <EmptyState title="لا توجد طلبات قيد المراجعة" hint="الطلبات الجديدة من صفحة «طلب انضمام» ستظهر هنا." />
      ) : (
        pending.map((r) => (
          <Card key={r.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-card-title font-bold">{r.display_name}</span>
              <Badge tone="purple">{ROLE_LABEL[r.requested_role]}</Badge>
              <Badge tone={STATUS_LABEL[r.status].tone}>{STATUS_LABEL[r.status].label}</Badge>
            </div>
            <div className="flex flex-col gap-1 text-caption text-on-dark-muted">
              <span dir="ltr" className="text-right">{r.email}</span>
              {r.note && <span>الملاحظة: {r.note}</span>}
              <span>أُرسل: {formatDate(r.created_at)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={busyId === r.id}
                onClick={() => setConfirm({ request: r, action: "approve" })}
              >
                {busyId === r.id ? "جاري التنفيذ..." : "موافقة"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={busyId === r.id}
                onClick={() => setConfirm({ request: r, action: "reject" })}
              >
                رفض
              </Button>
            </div>
          </Card>
        ))
      )}

      {reviewed.length > 0 && (
        <Card variant="lavender" className="flex flex-col gap-2">
          <span className="text-caption font-bold text-on-dark">طلبات سابقة</span>
          {reviewed.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-raised px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-bold text-on-dark">{r.display_name}</span>
                <Badge tone="purple">{ROLE_LABEL[r.requested_role]}</Badge>
                <span dir="ltr" className="text-caption text-on-dark-muted">{r.email}</span>
              </div>
              <Badge tone={STATUS_LABEL[r.status].tone}>{STATUS_LABEL[r.status].label}</Badge>
            </div>
          ))}
        </Card>
      )}

      {confirm && (
        <Modal
          open
          title={confirm.action === "approve" ? "تأكيد الموافقة" : "تأكيد الرفض"}
          onClose={() => setConfirm(null)}
        >
          <div className="flex flex-col gap-3">
            <p className="text-body text-on-dark-muted">
              {confirm.action === "approve"
                ? `سيتم تفعيل «${confirm.request.display_name}» بدور ${ROLE_LABEL[confirm.request.requested_role]} ويصبح بإمكانه تسجيل الدخول.`
                : `سيتم رفض طلب «${confirm.request.display_name}» ولن يحصل على أي صلاحية.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => run(confirm.request, confirm.action)}>
                {confirm.action === "approve" ? "موافقة" : "رفض"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirm(null)}>
                إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
