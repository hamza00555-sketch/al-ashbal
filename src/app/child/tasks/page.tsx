/* Child tasks (/child/tasks) — "مهامي": recitation / memorization / review. */
import { Badge, Card, PageHeader } from "@/components";
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
import { TaskActionButton } from "./TaskActionButton";

const RECORDABLE: ChildTaskStatus[] = ["not_started", "in_progress", "rerecord_needed"];

export default function ChildTasksPage() {
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
          {tasks.map((task) => (
            <Card key={task.id} className="flex flex-col gap-3">
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
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-body text-on-dark-muted">لا توجد مهام الآن.</p>
        </Card>
      )}
    </>
  );
}
