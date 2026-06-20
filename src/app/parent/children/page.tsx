/* Parent · children (/parent/children) — linked children with link/unlink. */
import Link from "next/link";
import { PageHeader } from "@/components";
import { getParentContext } from "../_shared";
import { ParentChildrenManage } from "./ParentChildrenManage";

export default function ParentChildrenPage() {
  const { viewer } = getParentContext();

  return (
    <>
      <PageHeader
        title="أطفالي"
        subtitle="الأطفال المرتبطون بحسابك"
        actions={
          <Link
            href="/parent/link-child"
            className="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-pill bg-surface-raised px-3.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft"
          >
            ربط طفل
          </Link>
        }
      />
      <ParentChildrenManage parentId={viewer.id} />
    </>
  );
}
