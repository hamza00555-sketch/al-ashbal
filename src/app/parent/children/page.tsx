/* Parent children (/parent/children) — detailed per-child cards (linked only). */
import { PageHeader } from "@/components";
import { ParentChildCard } from "../_ParentChildCard";
import { getParentContext } from "../_shared";

export default function ParentChildrenPage() {
  const { viewer, children } = getParentContext();

  return (
    <>
      <PageHeader title="أطفالك" subtitle={`${children.length} مرتبطون بك`} />
      <div className="grid gap-6 lg:grid-cols-2">
        {children.map((child) => (
          <ParentChildCard key={child.id} viewer={viewer} child={child} />
        ))}
      </div>
    </>
  );
}
