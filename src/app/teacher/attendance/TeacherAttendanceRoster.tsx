"use client";

import { Card } from "@/components";
import { getDemoChildById, useCreatedChildrenForHalaqa } from "@/lib/demo/createdChildren";
import { childAvatarSrc } from "@/lib/avatars";
import { getChildDisplayProfile, useChildDisplayProfile } from "@/lib/demo/childProfiles";
import { AttendanceManager, type AttendanceChild } from "./AttendanceManager";

/**
 * Attendance roster = every student registered/created in the single current
 * class (registration-based). Name/avatar follow the per-childId display sync.
 * Empty-first: no registered students → nothing to mark.
 */
export function TeacherAttendanceRoster({
  halaqaId,
  lessonId,
  teacherId,
  teacherName,
}: {
  halaqaId: string;
  lessonId: string;
  teacherId: string;
  teacherName: string;
}) {
  const ids = useCreatedChildrenForHalaqa(halaqaId).map((c) => c.id);
  // Subscribe to display-name changes so renamed children update live.
  useChildDisplayProfile(ids[0] ?? "__none__");

  const childrenList: AttendanceChild[] = ids
    .map((id) => getDemoChildById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => {
      const d = getChildDisplayProfile(c.id);
      return { id: c.id, name: d.displayName || c.displayName, avatarSrc: d.avatarUrl ?? childAvatarSrc(c.gender) };
    });

  if (childrenList.length === 0) {
    return (
      <Card variant="lavender">
        <p className="text-body text-on-dark-muted">لا يوجد طلاب مسجّلون لتسجيل حضورهم بعد.</p>
      </Card>
    );
  }

  return (
    <AttendanceManager
      lessonId={lessonId}
      childrenList={childrenList}
      teacherId={teacherId}
      teacherName={teacherName}
    />
  );
}
