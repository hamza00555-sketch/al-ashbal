/* Teacher · invitations (/teacher/invitations) — generate family/student
   invitations to onboard families and students. Demo-only, localStorage. */
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { InvitationsManager } from "./InvitationsManager";

export default function TeacherInvitationsPage() {
  const { viewer } = getTeacherContext();
  return (
    <>
      <PageHeader title="الدعوات" subtitle="أنشئ دعوة عائلة أو طالب وشاركها" />
      <InvitationsManager teacherId={viewer.id} />
    </>
  );
}
