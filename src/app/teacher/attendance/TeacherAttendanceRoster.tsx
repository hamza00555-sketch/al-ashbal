"use client";

import { Card } from "@/components";
import { childProfiles } from "@/lib/data/children";
import { childAvatarSrc } from "@/lib/avatars";
import { getChildDisplayProfile, useChildDisplayProfile } from "@/lib/demo/childProfiles";
import { useEnrolledChildIdsForHalaqa } from "@/lib/demo/halaqaEnrollment";
import { AttendanceManager, type AttendanceChild } from "./AttendanceManager";

/**
 * Attendance roster sourced from the halaqa ENROLLMENT store (not the seed
 * roster). Only children a parent enrolled with the halaqa code appear, and
 * their name/avatar follow the per-childId display sync. Empty-first: no
 * enrolled children → nothing to mark.
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
  const ids = useEnrolledChildIdsForHalaqa(halaqaId);
  // Subscribe to display-name changes so renamed children update live.
  useChildDisplayProfile(ids[0] ?? "__none__");

  const childrenList: AttendanceChild[] = ids
    .map((id) => childProfiles.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => {
      const d = getChildDisplayProfile(c.id);
      return { id: c.id, name: d.displayName || c.displayName, avatarSrc: d.avatarUrl ?? childAvatarSrc(c.gender) };
    });

  if (childrenList.length === 0) {
    return (
      <Card>
        <p className="text-body text-on-dark-muted">لا يوجد أطفال منضمّون لتسجيل حضورهم. شارك كود الحلقة مع أولياء الأمور.</p>
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
