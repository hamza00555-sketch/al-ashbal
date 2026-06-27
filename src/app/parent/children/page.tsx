/* Parent · children (/parent/children) — linked children with link/unlink.
   One clear "ربط طفل" CTA lives inside the list/empty state (not the header). */
import { PageHeader } from "@/components";
import { getParentContext } from "../_shared";
import { ParentChildrenManage } from "./ParentChildrenManage";

export default function ParentChildrenPage() {
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader title="أطفالي" subtitle="الأطفال المرتبطون بحسابك" />
      <ParentChildrenManage parentId={viewer.id} />
    </>
  );
}
