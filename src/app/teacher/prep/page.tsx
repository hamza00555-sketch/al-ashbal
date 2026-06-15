/*
  Teacher · prep (/teacher/prep) — prepare today's / an upcoming lesson.
  Saved to a demo store (localStorage); it then surfaces on the child's
  lessons & tasks and the parent's child detail. No backend.
*/
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { PrepForm } from "./PrepForm";

export default function TeacherPrepPage() {
  const { viewer, halaqas } = getTeacherContext();
  const halaqa = halaqas[0];

  if (!halaqa) {
    return (
      <>
        <PageHeader title="التحضير" />
        <p className="text-body text-on-dark-muted">لا توجد حلقة لتحضيرها.</p>
      </>
    );
  }

  return (
    <>
      <PageHeader title="التحضير" subtitle="جهّز درس اليوم أو الدرس القادم" />
      <PrepForm teacherId={viewer.id} halaqaId={halaqa.id} halaqaName={halaqa.name} />
    </>
  );
}
