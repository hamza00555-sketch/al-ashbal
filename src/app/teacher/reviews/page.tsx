/*
  Teacher · reviews (/teacher/reviews) — recorded recitations approved by the
  parent, awaiting THIS teacher's review. Driven entirely by the live
  submissions store (no stale seed list). Accepting awards points (unchanged).
*/
import { PageHeader } from "@/components";
import { getTeacherContext } from "../_shared";
import { TeacherReviewsEmpty } from "./TeacherReviewsEmpty";
import { TeacherSubmissions } from "./TeacherSubmissions";

export default async function TeacherReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const { viewer, halaqas } = getTeacherContext();

  return (
    <>
      <PageHeader title="مراجعة التسميع" subtitle="تظهر فقط الفيديوهات المعتمدة من ولي الأمر" />
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
