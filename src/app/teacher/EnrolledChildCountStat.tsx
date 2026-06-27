"use client";

import { StatCard } from "@/components";
import { useCreatedChildrenForHalaqa } from "@/lib/demo/createdChildren";
import { IconUsers } from "./_icons";

/** Live student count = students registered/created in the current class. */
export function EnrolledChildCountStat({ halaqaId }: { halaqaId: string }) {
  const ids = useCreatedChildrenForHalaqa(halaqaId);
  return (
    <StatCard
      variant="lavender"
      label="أطفال الحلقة"
      value={ids.length}
      tone="purple"
      icon={<span className="inline-flex size-8 items-center justify-center"><IconUsers /></span>}
    />
  );
}
