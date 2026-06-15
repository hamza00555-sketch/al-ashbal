/* Compact per-child block for the parent dashboard (server component). */
import { Avatar, Badge, Card, ProgressBar } from "@/components";
import {
  getLessonsForChild,
  getProgressForChild,
  getTeacherReviewsForChild,
  getWishesForViewer,
} from "@/lib/data";
import type { ChildProfile, User } from "@/types";
import { IconBook, IconSparkle, IconStar } from "./_icons";

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-purple/15 p-1.5 text-purple-soft">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-caption text-on-dark-muted">{label}</span>
        {children}
      </div>
    </div>
  );
}

export function ParentChildCard({ viewer, child }: { viewer: User; child: ChildProfile }) {
  const progress = getProgressForChild(viewer, child.id);
  const lastLesson =
    getLessonsForChild(viewer, child.id)
      .filter((l) => l.status === "completed")
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))[0] ?? null;
  const review =
    getTeacherReviewsForChild(viewer, child.id).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )[0] ?? null;
  const teacherNote = review?.teacherNote ?? review?.behaviorNote ?? null;
  const wishes = getWishesForViewer(viewer, child.id);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={child.displayName} size="md" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-card-title font-bold break-words">{child.displayName}</span>
          <span className="text-caption text-on-dark-muted">متابعة هادئة لتقدّمه</span>
        </div>
      </div>

      {/* progress snapshot */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge tone="purple">قرآن {progress?.quranPercent ?? 0}%</Badge>
          <Badge tone="gold">تجويد {progress?.tajweedPercent ?? 0}%</Badge>
          <Badge tone="success">سلوك {progress?.behaviorPercent ?? 0}%</Badge>
        </div>
        <ProgressBar value={progress?.currentProgressBar.current ?? 0} tone="purple" label="رحلة الشبل" />
      </div>

      {lastLesson && (
        <Row icon={<IconBook />} label="ملخص آخر درس">
          <span className="text-body break-words">
            {lastLesson.title}
            {lastLesson.quranSegment ? ` — ${lastLesson.quranSegment}` : ""}
          </span>
        </Row>
      )}

      {teacherNote && (
        <Row icon={<IconStar />} label="ملاحظة المعلم">
          <span className="text-body break-words">{teacherNote}</span>
        </Row>
      )}

      <Row icon={<IconSparkle />} label="أمنياته (تظهر لك فقط)">
        {wishes.length > 0 ? (
          <span className="text-body break-words">{wishes.map((w) => w.title).join(" · ")}</span>
        ) : (
          <span className="text-body text-on-dark-muted">لا أمنيات بعد.</span>
        )}
      </Row>
    </Card>
  );
}
