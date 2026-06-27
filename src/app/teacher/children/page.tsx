/*
  Teacher · children (/teacher/children).
  A simple VISUAL grid of the class students — every student registered/created
  in the single current class (registration based). Tapping a child opens their
  detail page.
*/
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { TeacherHalaqaChildren } from "./TeacherHalaqaChildren";

export default function TeacherChildrenPage() {
  const { halaqas } = getTeacherContext();
  const halaqa = halaqas[0] ?? null;

  return (
    <>
      <PageHeader title="أطفال الحلقة" subtitle="الطلاب المسجّلون في صفّك" />
      {halaqa ? <TeacherHalaqaChildren halaqaId={halaqa.id} /> : null}
    </>
  );
}
