/*
  Teacher · reviews (/teacher/reviews) — recitations awaiting teacher review.
  Only parent-approved videos surface here (getPendingTeacherReviews already
  filters to status 'pending_teacher_review' within the teacher's halaqa).
  No real video upload/playback.
*/
import { Card, PageHeader } from "@/components";
import { getPendingTeacherReviews } from "@/lib/data";
import { IconVideo } from "../_icons";
import { getTeacherContext } from "../_shared";
import { ReviewActions } from "./ReviewActions";

export default function TeacherReviewsPage() {
  const { viewer, children } = getTeacherContext();
  const pending = getPendingTeacherReviews(viewer);
  const nameOf = (childId: string) =>
    children.find((c) => c.id === childId)?.displayName ?? "طفل الحلقة";

  return (
    <>
      <PageHeader
        title="مراجعة التسميع"
        subtitle="تظهر فقط الفيديوهات المعتمدة من ولي الأمر"
      />

      {pending.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {pending.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-purple/15 p-2.5 text-purple-soft">
                  <IconVideo />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{r.title}</span>
                  <span className="text-caption text-on-dark-muted">{nameOf(r.childId)} · تسميع جديد</span>
                </div>
              </div>
              {/* video placeholder (no real playback in the mock phase) */}
              <div className="flex aspect-video w-full items-center justify-center rounded-md bg-night text-on-dark-muted">
                <span className="text-caption">فيديو التسميع (تجريبي)</span>
              </div>
              <ReviewActions />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-mint/15 p-2.5 text-mint">
            <IconVideo />
          </span>
          <p className="text-body text-on-dark-muted">لا توجد تسميعات بانتظار المراجعة الآن.</p>
        </Card>
      )}
    </>
  );
}
