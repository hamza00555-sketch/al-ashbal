/* Child tasks (/child/tasks) — "مهامي": recitation / memorization / review. */
import { AppIllustration, Badge, Card, PageHeader } from "@/components";
import { cn } from "@/lib/cn";
import { getTasksForChild, getTeacherIdsForChild } from "@/lib/data";
import type { ChildTaskStatus } from "@/types";
import {
  getChildContext,
  TASK_STATUS,
  TASK_SUBJECT_LABEL,
  TASK_TYPE_LABEL,
} from "../_shared";
import { PrepTasks } from "./PrepTasks";
import { RecitationTaskAction } from "./RecitationTaskAction";
import { ScrollToId } from "./ScrollToId";
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
  const teacherId = getTeacherIdsForChild(viewer, child.id)[0];

  return (
    <>
      <PageHeader title="مهامي" subtitle="التسميع والحفظ والمراجعة" />

      <PrepTasks
        halaqaId={child.halaqaId}
        childId={child.id}
        childName={child.displayName}
        childUserId={childUserId}
        parentUserId={parentUserId}
        teacherId={teacherId}
      />

      {tasks.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => {
            const highlighted = task.id === highlightTaskId;
            return (
            <Card
              key={task.id}
              id={`task-${task.id}`}
              className={cn("flex flex-col gap-3", highlighted && "ring-2 ring-purple-soft")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-card-title font-bold break-words">{task.title}</span>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="purple">{TASK_TYPE_LABEL[task.type]}</Badge>
                    <Badge tone="neutral">{TASK_SUBJECT_LABEL[task.subject]}</Badge>
                    <Badge tone="neutral">{task.dueLabel}</Badge>
                  </div>
                </div>
              </div>
              {highlighted && (
                <span>
                  <Badge tone="purple">وصلت من الإشعار</Badge>
                </span>
              )}
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
          })}
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
