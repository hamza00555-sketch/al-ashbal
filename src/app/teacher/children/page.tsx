/*
  Teacher · children (/teacher/children).
  TOP: the REAL registered children of the teacher's class from Supabase
  (RLS-scoped — families registered via backend invitations, visible from any
  device). BELOW: the local demo roster (unchanged until the activities/
  submissions migration).
*/
import { Avatar, Badge, Card, PageHeader, SectionTitle } from "@/components";
import { listChildrenForTeacher } from "@/lib/backend/families";
import { getTeacherContext } from "../_shared";
import { TeacherHalaqaChildren } from "./TeacherHalaqaChildren";

export default async function TeacherChildrenPage() {
  const { halaqas } = getTeacherContext();
  const halaqa = halaqas[0] ?? null;
  const realChildren = await listChildrenForTeacher().catch(() => []);

  return (
    <>
      <PageHeader title="أطفال الحلقة" subtitle="الطلاب المسجّلون في صفّك" />

      <Card className="flex flex-col gap-3">
        <SectionTitle
          title="الأطفال المسجّلون (قاعدة البيانات)"
          subtitle="عائلات سجّلت عبر دعوات الحلقة — تظهر من أي جهاز"
        />
        {realChildren.length === 0 ? (
          <p className="text-body text-on-light-muted">
            لا أطفال مسجّلون بعد — أنشئ دعوة عائلة من صفحة «الدعوات» وشاركها.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {realChildren.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-md bg-purple/5 px-3 py-2 ring-1 ring-purple/10">
                <Avatar name={c.display_name} size="md" src={c.avatar_url ?? undefined} />
                <span className="flex-1 text-body font-bold text-on-dark">{c.display_name}</span>
                <Badge tone="success">مسجّل</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {halaqa ? <TeacherHalaqaChildren halaqaId={halaqa.id} /> : null}
    </>
  );
}
