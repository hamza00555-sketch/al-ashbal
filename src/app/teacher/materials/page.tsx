/*
  Teacher · materials (/teacher/materials) — manage the learning materials that
  drive the child's progress rings. Demo store (localStorage); no backend.
  Phase B: add / edit / reorder / show-hide / archive. No lesson content yet,
  no task linking yet.
*/
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { MaterialsManager } from "./MaterialsManager";

export default function TeacherMaterialsPage() {
  const { halaqas } = getTeacherContext();
  const halaqa = halaqas[0];

  if (!halaqa) {
    return (
      <>
        <PageHeader title="المواد والتقدّم" />
        <p className="text-body text-on-dark-muted">لا توجد حلقة لإدارة موادها.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="المواد والتقدّم" subtitle="المواد هي مصدر دوائر تقدّم الطفل" />
      <MaterialsManager halaqaId={halaqa.id} />
    </>
  );
}
