/*
  Teacher · join requests (/teacher/join-requests) — controlled onboarding.
  Lists join_requests (RLS: approved teachers only) with approve/reject.
  All privileged writes run in server actions (requireTeacher + admin client).
*/
import { PageHeader } from "@/components";
import { listJoinRequests } from "@/lib/backend/joinRequests";
import { JoinRequestsList } from "./JoinRequestsList";

export default async function TeacherJoinRequestsPage() {
  const requests = await listJoinRequests();

  return (
    <>
      <PageHeader
        title="طلبات الانضمام"
        subtitle="راجع طلبات المعلمين وأولياء الأمور — الموافقة تفعّل الحساب"
      />
      <JoinRequestsList requests={requests} />
    </>
  );
}
