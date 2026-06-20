/*
  Teacher · children (/teacher/children).
  A simple VISUAL grid of the teacher's halaqa children — sourced from the local
  ENROLLMENT store (empty-first): a child appears only after a parent enrolls
  them with the halaqa code. Tapping a child opens their detail page.
*/
import Link from "next/link";
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { TeacherHalaqaChildren } from "./TeacherHalaqaChildren";

export default function TeacherChildrenPage() {
  const { halaqas } = getTeacherContext();
  const halaqa = halaqas[0] ?? null;

  return (
    <>
      <PageHeader
        title="أطفال الحلقة"
        subtitle="الأطفال المنضمّون بكود الحلقة"
        actions={
          <Link
            href="/teacher/halaqa"
            className="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-pill bg-surface-raised px-3.5 text-caption font-bold text-on-dark ring-1 ring-purple-soft/30 transition hover:bg-white/5 hover:ring-purple-soft"
          >
            كود الحلقة
          </Link>
        }
      />
      {halaqa ? <TeacherHalaqaChildren halaqaId={halaqa.id} /> : null}
    </>
  );
}
