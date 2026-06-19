/* Shared helpers + label maps for the child pages (keeps pages thin). */
import type { BadgeTone } from "@/components";
import { getMockUser } from "@/lib/data";
import { childProfiles } from "@/lib/data/children";
import type {
  AttendanceStatus,
  ChildProfile,
  ChildTaskStatus,
  ChildTaskSubject,
  ChildTaskType,
  LessonStatus,
  RecitationStatus,
  User,
} from "@/types";

/**
 * Resolve the current (mock) child viewer + their own profile.
 * Empty-first: the roster (db.children) is empty, so we resolve the demo child
 * profile DIRECTLY from the seed by userId — identity only. All seed-gated data
 * (tasks/progress/badges/wishes) stays empty until the user builds it.
 */
export function getChildContext(): { viewer: User; child: ChildProfile | null } {
  const viewer = getMockUser("child");
  const child = childProfiles.find((c) => c.userId === viewer.id) ?? childProfiles[0] ?? null;
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

export const TASK_STATUS: Record<ChildTaskStatus, { label: string; tone: BadgeTone }> = {
  not_started: { label: "لم يبدأ", tone: "neutral" },
  in_progress: { label: "قيد التنفيذ", tone: "purple" },
  submitted: { label: "تم الإرسال", tone: "purple" },
  pending_parent_approval: { label: "بانتظار موافقة ولي الأمر", tone: "warning" },
  pending_teacher_review: { label: "بانتظار مراجعة المعلم", tone: "purple" },
  accepted: { label: "مقبول", tone: "success" },
  rerecord_needed: { label: "مطلوب إعادة", tone: "danger" },
};

export const TASK_TYPE_LABEL: Record<ChildTaskType, string> = {
  recitation: "تسميع",
  memorization: "حفظ",
  review: "مراجعة",
};

export const TASK_SUBJECT_LABEL: Record<ChildTaskSubject, string> = {
  quran: "القرآن",
  tajweed: "التجويد",
  behavior: "السلوك",
};

/** Tasks that still need the child's attention (anything not accepted). */
export function isOpenTask(status: ChildTaskStatus): boolean {
  return status !== "accepted";
}

export const LESSON_STATUS: Record<LessonStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "مسودة", tone: "neutral" },
  scheduled: { label: "مجدول", tone: "purple" },
  live: { label: "مباشر الآن", tone: "success" },
  completed: { label: "منتهٍ", tone: "neutral" },
  cancelled: { label: "ملغى", tone: "danger" },
};
