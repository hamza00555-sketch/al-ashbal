"use client";

import { StatCard } from "@/components";
import { useEnrolledChildIdsForHalaqa } from "@/lib/demo/halaqaEnrollment";
import { IconUsers } from "./_icons";

/** Live "أطفال الحلقة" count from the enrollment store (0 until a parent joins). */
export function EnrolledChildCountStat({ halaqaId }: { halaqaId: string }) {
  const ids = useEnrolledChildIdsForHalaqa(halaqaId);
  return (
    <StatCard
      label="أطفال الحلقة"
      value={ids.length}
      tone="purple"
      icon={<span className="inline-flex size-6 items-center justify-center"><IconUsers /></span>}
    />
  );
}
