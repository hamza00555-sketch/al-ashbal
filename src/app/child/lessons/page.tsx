/*
  Child lessons (/child/lessons) — today's lesson details (compact cards from
  the teacher's prep) + the attendance gate as the big primary action.
  No student tasks here — those live in /child/tasks.
*/
import { PageHeader } from "@/components";
import { getChildContext } from "../_shared";
import { ChildLessonsView } from "./ChildLessonsView";

export default function ChildLessonsPage() {
  const { child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  return (
    <>
      <PageHeader title="الدروس" subtitle="درس اليوم وحضور الحلقة" />
      <ChildLessonsView halaqaId={child.halaqaId} childId={child.id} />
    </>
  );
}
