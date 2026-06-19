"use client";

import Link from "next/link";
import { AppIcon, Card } from "@/components";
import { useSubmissions } from "@/lib/demo/submissions";
import { IconVideo } from "./_icons";

/**
 * Parent home pending alert — driven by the LIVE submissions store, not a stale
 * seed. Counts only this parent's recordings still awaiting the parent's
 * approval (state === "pending_parent"). Once approved/sent back it disappears,
 * and it never re-appears on reload.
 */
export function ParentPendingAlert({ parentUserId }: { parentUserId: string }) {
  const submissions = useSubmissions();
  const count = Object.values(submissions).filter(
    (s) => s.parentUserId === parentUserId && s.state === "pending_parent",
  ).length;

  if (count === 0) return null;

  return (
    <Link href="/parent/approvals" className="block rounded-lg transition hover:brightness-110">
      <Card className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple">
          <AppIcon name="icon_record_video" fallback={<IconVideo />} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-card-title font-bold break-words">
            لديك {count} تسجيل بانتظار موافقتك
          </span>
          <span className="text-caption opacity-70">اضغط لمراجعة الموافقات</span>
        </div>
      </Card>
    </Link>
  );
}
