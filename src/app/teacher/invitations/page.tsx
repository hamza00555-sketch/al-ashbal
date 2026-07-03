/* Teacher · invitations (/teacher/invitations) — SUPABASE-BACKED family
   invitations (Phase 2). Created/revoked server-side AS the teacher under
   creator-only RLS; links are portable across devices. The old localStorage
   demo invitations (family + student) are retired from this page. */
import { PageHeader } from "@/components";
import { listMyInvitations } from "@/lib/backend/invitations";
import { BackendInvitationsManager } from "./BackendInvitationsManager";

export default async function TeacherInvitationsPage() {
  const invitations = await listMyInvitations();
  return (
    <>
      <PageHeader title="الدعوات" subtitle="أنشئ دعوة عائلة وشاركها — تُحفظ في قاعدة البيانات" />
      <BackendInvitationsManager invitations={invitations} />
    </>
  );
}
