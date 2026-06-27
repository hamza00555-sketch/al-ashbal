/* Teacher · class (/teacher/halaqa) — the single current class roster.
   No user-facing code: students appear automatically when they register. */
import { Card, PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
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
      <PageHeader title="الحلقة" subtitle="الطلاب المسجّلون في صفّك" />
      <TeacherHalaqaChildren halaqaId={halaqa.id} withHeading />
    </>
  );
}
