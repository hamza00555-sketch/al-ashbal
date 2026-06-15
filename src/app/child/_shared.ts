/* Shared helpers + label maps for the child pages (keeps pages thin). */
import type { BadgeTone } from "@/components";
import { getMockUser, getVisibleChildren } from "@/lib/data";
import type {
  AttendanceStatus,
  ChildProfile,
  LessonStatus,
  RecitationStatus,
  User,
} from "@/types";

/** Resolve the current (mock) child viewer + their own profile. */
export function getChildContext(): { viewer: User; child: ChildProfile | null } {
  const viewer = getMockUser("child");
  const child = getVisibleChildren(viewer)[0] ?? null;
  return { viewer, child };
}

export const RECITATION_STATUS: Record<RecitationStatus, { label: string; tone: BadgeTone }> = {
  recorded: { label: "جاهز للإرسال", tone: "purple" },
  pending_parent_approval: { label: "بانتظار موافقة ولي الأمر", tone: "warning" },
  parent_rejected: { label: "خلّينا نعيدها بشكل أوضح", tone: "danger" },
  pending_teacher_review: { label: "بانتظار تقييم المعلم", tone: "purple" },
  teacher_reviewed: { label: "تم التقييم", tone: "success" },
  deleted: { label: "محذوف", tone: "neutral" },
};

export const ATTENDANCE_STATUS: Record<AttendanceStatus, { label: string; tone: BadgeTone }> = {
  present: { label: "حاضر", tone: "success" },
  late: { label: "متأخر", tone: "warning" },
  absent: { label: "غائب", tone: "danger" },
  excused: { label: "بعذر", tone: "purple" },
  manual_override: { label: "تعديل يدوي", tone: "neutral" },
};

export const LESSON_STATUS: Record<LessonStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "مسودة", tone: "neutral" },
  scheduled: { label: "مجدول", tone: "purple" },
  live: { label: "مباشر الآن", tone: "success" },
  completed: { label: "منتهٍ", tone: "neutral" },
  cancelled: { label: "ملغى", tone: "danger" },
};
