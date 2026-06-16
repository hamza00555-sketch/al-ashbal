/*
  Teacher · reviews (/teacher/reviews) — recitations awaiting teacher review.
  Only parent-approved videos surface (db pending + parent-approved demo queue).
  No real video upload/playback.
*/
import { PageHeader } from "@/components";
import { getPendingTeacherReviews } from "@/lib/data";
import { getTeacherContext } from "../_shared";
import { TeacherReviewsList } from "./TeacherReviewsList";
import { TeacherSubmissions } from "./TeacherSubmissions";
import type { ReviewItem } from "./ReviewActions";

export default async function TeacherReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const { viewer, children } = getTeacherContext();
  const pending = getPendingTeacherReviews(viewer);

  const dbItems: ReviewItem[] = pending.map((r) => {
    const child = children.find((c) => c.id === r.childId);
    return {
      recitationId: r.id,
      childId: r.childId,
      childName: child?.displayName ?? "طفل الحلقة",
      title: r.title,
      childUserId: child?.userId ?? "",
      parentUserId: child?.parentIds[0] ?? "",
    };
  });

  return (
    <>
      <PageHeader title="مراجعة التسميع" subtitle="تظهر فقط الفيديوهات المعتمدة من ولي الأمر" />
      <TeacherSubmissions teacherId={viewer.id} highlightSubmissionId={submissionId} />
      <TeacherReviewsList dbItems={dbItems} />
    </>
  );
}
