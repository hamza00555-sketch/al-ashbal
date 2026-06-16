/*
  Teacher · activities (/teacher/activities) — Phase 01 · Task A5.
  Create & activate a TEMPORARY in-class activity/quiz that appears on the
  child's home (/child) for the same halaqa. Demo state only (localStorage);
  no backend, no mock-db writes.
*/
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { ActivitiesManager, type HalaqaChild } from "./ActivitiesManager";

export default function TeacherActivitiesPage() {
  const { viewer, halaqas, children } = getTeacherContext();
  const halaqa = halaqas[0];

  if (!halaqa) {
    return (
      <>
        <PageHeader title="الأنشطة" />
        <p className="text-body text-on-dark-muted">لا توجد حلقة لإدارة أنشطتها.</p>
      </>
    );
  }

  const halaqaChildren: HalaqaChild[] = children
    .filter((c) => c.halaqaId === halaqa.id)
    .map((c) => ({ id: c.id, name: c.displayName, userId: c.userId ?? "" }));

  return (
    <>
      <PageHeader title="الأنشطة" subtitle="فعّل نشاطًا مؤقتًا أثناء الحلقة" />
      <ActivitiesManager
        teacherId={viewer.id}
        teacherName={viewer.displayName}
        halaqaId={halaqa.id}
        halaqaName={halaqa.name}
        halaqaChildren={halaqaChildren}
      />
    </>
  );
}
