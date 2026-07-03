/*
  Teacher · reviews (/teacher/reviews) — recorded recitations approved by the
  parent, awaiting THIS teacher's review. Driven entirely by the live
  submissions store (no stale seed list). Accepting awards points (unchanged).
*/
import { PageHeader } from "@/components";
import { listSubmissionsForTeacher } from "@/lib/backend/submissions";
import { listChildrenForTeacher } from "@/lib/backend/families";
import { listAssignmentsForTeacher } from "@/lib/backend/assignments";
import { getTeacherContext } from "../_shared";
import { RealReviews } from "./RealReviews";
import { TeacherReviewsEmpty } from "./TeacherReviewsEmpty";
import { TeacherSubmissions } from "./TeacherSubmissions";

export default async function TeacherReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const { viewer, halaqas } = getTeacherContext();

  // REAL pipeline (RLS-scoped): pending submissions + child names + open task.
  const [submissions, children, assignments] = await Promise.all([
    listSubmissionsForTeacher().catch(() => []),
    listChildrenForTeacher().catch(() => []),
    listAssignmentsForTeacher().catch(() => []),
  ]);
  const nameOf = new Map(children.map((c) => [c.id, c.display_name]));
  const assignmentPoints = new Map(assignments.map((a) => [a.id, a.points ?? 10]));
  const pending = submissions
    .filter((s) => s.state === "pending_teacher")
    .map((s) => ({
      id: s.id,
      childName: nameOf.get(s.child_id) ?? "طفل",
      title: s.title,
      state: s.state,
      createdAt: s.created_at,
      suggestedPoints: (s.assignment_id ? assignmentPoints.get(s.assignment_id) : null) ?? 10,
    }));
  const openAssignment = assignments.find((a) => a.status === "active") ?? null;

  return (
    <>
      <PageHeader title="مراجعة التسميع" subtitle="تظهر فقط الفيديوهات المعتمدة من ولي الأمر" />

      <RealReviews pending={pending} assignmentTitle={openAssignment?.title ?? null} />
      <TeacherSubmissions
        teacherId={viewer.id}
        teacherName={viewer.displayName}
        halaqaId={halaqas[0]?.id ?? ""}
        highlightSubmissionId={submissionId}
      />
      <TeacherReviewsEmpty teacherId={viewer.id} />
    </>
  );
}
