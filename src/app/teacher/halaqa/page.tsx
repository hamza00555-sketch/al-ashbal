/* Teacher · halaqa code (/teacher/halaqa) — invite code to share with parents. */
import { Card, PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { HalaqaCodeCard } from "./HalaqaCodeCard";
import { TeacherHalaqaChildren } from "../children/TeacherHalaqaChildren";

export default function TeacherHalaqaPage() {
  const { halaqas } = getTeacherContext();
  const halaqa = halaqas[0] ?? null;

  if (!halaqa) {
    return (
      <>
        <PageHeader title="الحلقة" />
        <Card>
          <p className="text-body text-on-dark-muted">لا توجد حلقة مرتبطة بك.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="الحلقة" subtitle="كود الحلقة والأطفال المنضمّون" />
      <HalaqaCodeCard halaqaId={halaqa.id} halaqaName={halaqa.name} />
      <TeacherHalaqaChildren halaqaId={halaqa.id} withHeading />
    </>
  );
}
