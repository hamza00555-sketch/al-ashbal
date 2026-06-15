/* Shared helpers + label maps for the teacher pages (keeps pages thin). */
import type { BadgeTone } from "@/components";
import { getMockUser, getTeacherHalaqas, getVisibleChildren } from "@/lib/data";
import type { AttendanceStatus, ChildProfile, Halaqa, RecitationStatus, User } from "@/types";

/** Resolve the current (mock) teacher viewer + their halaqa(s) + halaqa children. */
export function getTeacherContext(): {
  viewer: User;
  halaqas: Halaqa[];
  children: ChildProfile[];
} {
  const viewer = getMockUser("teacher");
  return {
    viewer,
    halaqas: getTeacherHalaqas(viewer),
    children: getVisibleChildren(viewer),
  };
}

export const ATTENDANCE_STATUS: Record<AttendanceStatus, { label: string; tone: BadgeTone }> = {
  present: { label: "حاضر", tone: "success" },
  late: { label: "متأخر", tone: "warning" },
  absent: { label: "غائب", tone: "danger" },
  excused: { label: "بعذر", tone: "purple" },
  manual_override: { label: "تعديل يدوي", tone: "neutral" },
};

export const RECITATION_STATUS: Record<RecitationStatus, { label: string; tone: BadgeTone }> = {
  recorded: { label: "مُسجّل", tone: "neutral" },
  pending_parent_approval: { label: "بانتظار ولي الأمر", tone: "warning" },
  parent_rejected: { label: "أعيد التسجيل", tone: "danger" },
  pending_teacher_review: { label: "بانتظار المراجعة", tone: "purple" },
  teacher_reviewed: { label: "تمت المراجعة", tone: "success" },
  deleted: { label: "محذوف", tone: "neutral" },
};
