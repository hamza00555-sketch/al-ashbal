/* Child tasks (/child/tasks) — "مهامي": recitation / memorization / review. */
import { AppAssetIcon, AppIllustration, Badge, Card, PageHeader } from "@/components";
import { cn } from "@/lib/cn";
import { getTasksForChild, getTeacherIdForHalaqa } from "@/lib/data";
import type { ChildTaskStatus, ChildTaskType } from "@/types";
import { IconBook, IconTasks, IconVideo } from "../_icons";

/** Task-type → 3D icon asset (+ inline-SVG fallback). */
const TASK_ICON: Record<ChildTaskType, { name: string; fallback: React.ReactNode }> = {
  recitation: { name: "icon_record_video", fallback: <IconVideo /> },
  memorization: { name: "icon_tasks", fallback: <IconTasks /> },
  review: { name: "icon_review", fallback: <IconBook /> },
};
import {
  getChildContext,
  TASK_STATUS,
  TASK_SUBJECT_LABEL,
  TASK_TYPE_LABEL,
} from "../_shared";
import { PrepTasks } from "./PrepTasks";
import { RecitationTaskAction } from "./RecitationTaskAction";
import { ScrollToId } from "./ScrollToId";
import { StudentAssignmentTasks } from "./StudentAssignmentTasks";
import { TaskActionButton } from "./TaskActionButton";

const RECORDABLE: ChildTaskStatus[] = ["not_started", "in_progress", "rerecord_needed"];

export default async function ChildTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const { taskId: highlightTaskId } = await searchParams;
  const { viewer, child } = getChildContext();
  if (!child) return <p className="text-body text-on-dark-muted">لا توجد بيانات لعرضها.</p>;

  const tasks = getTasksForChild(viewer, child.id);
  const childUserId = child.userId ?? "";
  const parentUserId = child.parentIds[0] ?? "";
  const teacherId = getTeacherIdForHalaqa(child.halaqaId);

  // Active (needs the child's action) on top; submitted/handled move to the bottom.
  // Order WITHIN each group is preserved (the source order).
  const activeTasks = tasks.filter((t) => RECORDABLE.includes(t.status));
  const doneTasks = tasks.filter((t) => !RECORDABLE.includes(t.status));

  const renderTaskCard = (task: (typeof tasks)[number]) => {
    const highlighted = task.id === highlightTaskId;
    return (
      <Card
        key={task.id}
        id={`task-${task.id}`}
        className={cn("flex flex-col gap-3", highlighted && "ring-2 ring-purple-soft")}
      >
        <div className="flex items-start gap-3">
          <AppAssetIcon
            src={`/assets/icons/${TASK_ICON[task.type].name}.png`}
            size="lg"
            className="rounded-full bg-purple/15 text-purple-soft"
            fallback={TASK_ICON[task.type].fallback}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-card-title font-bold break-words">{task.title}</span>
            {/* meta هادئ في سطر واحد بدل رصّ التاقات */}
            <p className="text-caption text-on-dark-muted break-words">
              {TASK_TYPE_LABEL[task.type]} · {TASK_SUBJECT_LABEL[task.subject]} · {task.dueLabel}
            </p>
            {highlighted && (
              <span className="mt-1">
                <Badge tone="purple">وصلت من الإشعار</Badge>
              </span>
            )}
          </div>
        </div>
        {task.description && (
          <p className="text-body text-on-dark-muted break-words">{task.description}</p>
        )}
        {task.type === "recitation" ? (
          <RecitationTaskAction
            taskId={task.id}
            childId={child.id}
            childName={child.displayName}
            childUserId={childUserId}
            parentUserId={parentUserId}
            teacherId={teacherId}
            title={task.title}
            allowAudio
            allowVideo
            baseCanRecord={RECORDABLE.includes(task.status)}
            baseStatusLabel={TASK_STATUS[task.status].label}
            baseStatusTone={TASK_STATUS[task.status].tone}
          />
        ) : (
          <TaskActionButton
            type={task.type}
            status={task.status}
            statusLabel={TASK_STATUS[task.status].label}
          />
        )}
      </Card>
    );
  };

  return (
    <>
      <PageHeader title="مهامي" subtitle="التسميع والحفظ والمراجعة" />

      <StudentAssignmentTasks
        halaqaId={child.halaqaId}
        childId={child.id}
        childName={child.displayName}
        childUserId={childUserId}
        parentUserId={parentUserId}
        teacherId={teacherId}
      />

      <PrepTasks
        halaqaId={child.halaqaId}
        childId={child.id}
        childName={child.displayName}
        childUserId={childUserId}
        parentUserId={parentUserId}
        teacherId={teacherId}
      />

      {tasks.length > 0 ? (
        <div className="flex flex-col gap-6">
          {activeTasks.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-body font-bold text-on-dark">تحتاج إنجاز</h2>
              <div className="grid gap-4 lg:grid-cols-2">{activeTasks.map(renderTaskCard)}</div>
            </section>
          ) : (
            <p className="text-body text-on-dark-muted">لا توجد مهام بانتظار إجراء حاليًا.</p>
          )}

          {doneTasks.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-body font-bold text-on-dark-muted">تم إرسالها أو إنجازها</h2>
              <div className="grid gap-4 lg:grid-cols-2">{doneTasks.map(renderTaskCard)}</div>
            </section>
          )}
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-3 text-center">
          <AppIllustration name="illustration_no_tasks" className="size-28" />
          <p className="text-body text-on-dark-muted">لا توجد مهام الآن.</p>
        </Card>
      )}

      {highlightTaskId && <ScrollToId targetId={`task-${highlightTaskId}`} />}
    </>
  );
}
