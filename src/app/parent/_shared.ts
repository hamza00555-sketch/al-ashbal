/* Shared helpers + label maps for the parent pages (keeps pages thin). */
import type { BadgeTone } from "@/components";
import { getMockUser, getVisibleChildren, type ChildStatusLevel } from "@/lib/data";
import type {
  AttendanceStatus,
  ChildProfile,
  ChildTaskStatus,
  RecitationStatus,
  User,
} from "@/types";

/** Resolve the current (mock) parent viewer + their linked children only. */
export function getParentContext(): { viewer: User; children: ChildProfile[] } {
  const viewer = getMockUser("parent");
  return { viewer, children: getVisibleChildren(viewer) };
}

export const CHILD_STATUS: Record<
  ChildStatusLevel,
  { label: string; tone: BadgeTone; ring: string }
> = {
  excellent: { label: "ممتاز", tone: "success", ring: "ring-mint" },
  follow_up: { label: "يحتاج متابعة", tone: "warning", ring: "ring-gold" },
  intervene: { label: "يحتاج تدخل", tone: "danger", ring: "ring-coral" },
};

export const TASK_STATUS: Record<ChildTaskStatus, { label: string; tone: BadgeTone }> = {
  not_started: { label: "لم يبدأ", tone: "neutral" },
  in_progress: { label: "قيد التنفيذ", tone: "purple" },
  submitted: { label: "تم الإرسال", tone: "purple" },
  pending_parent_approval: { label: "بانتظار موافقتك", tone: "warning" },
  pending_teacher_review: { label: "بانتظار مراجعة المعلم", tone: "purple" },
  accepted: { label: "مقبول", tone: "success" },
  rerecord_needed: { label: "مطلوب إعادة", tone: "danger" },
};

export const RECITATION_STATUS: Record<RecitationStatus, { label: string; tone: BadgeTone }> = {
  recorded: { label: "مُسجّل", tone: "neutral" },
  pending_parent_approval: { label: "بانتظار موافقتك", tone: "warning" },
  parent_rejected: { label: "طلبت إعادة التسجيل", tone: "danger" },
  pending_teacher_review: { label: "بانتظار مراجعة المعلم", tone: "purple" },
  teacher_reviewed: { label: "تمت المراجعة", tone: "success" },
  deleted: { label: "محذوف", tone: "neutral" },
};

export const ATTENDANCE_STATUS: Record<AttendanceStatus, { label: string; tone: BadgeTone }> = {
  present: { label: "حاضر", tone: "success" },
  late: { label: "متأخر", tone: "warning" },
  absent: { label: "غائب", tone: "danger" },
  excused: { label: "بعذر", tone: "purple" },
  manual_override: { label: "تعديل يدوي", tone: "neutral" },
};
