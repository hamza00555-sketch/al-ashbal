import type { ChildTask, ClassActivity } from "@/types";

/*
  Mock child tasks (recitation / memorization / review) + a temporary class
  activity. Demo data only — no real recording, no backend.
*/
export const childTasks: ChildTask[] = [
  {
    id: "task-ch1-1",
    childId: "ch1",
    title: "تسميع سورة الملك من آية 1 إلى 5",
    type: "recitation",
    subject: "quran",
    dueLabel: "اليوم",
    status: "not_started",
    description: "سجّل تسميعك ثم يراجعه ولي أمرك قبل إرساله للمعلم.",
  },
  {
    id: "task-ch1-5",
    childId: "ch1",
    title: "تسميع سورة الملك من آية 1 إلى 4",
    type: "recitation",
    subject: "quran",
    dueLabel: "أمس",
    status: "pending_parent_approval",
    description: "بانتظار مراجعة ولي أمرك قبل إرساله للمعلم.",
  },
  {
    id: "task-ch1-2",
    childId: "ch1",
    title: "مراجعة أحكام النون الساكنة",
    type: "review",
    subject: "tajweed",
    dueLabel: "غدًا",
    status: "in_progress",
    description: "راجع الإظهار والإدغام والإقلاب والإخفاء.",
  },
  {
    id: "task-ch1-3",
    childId: "ch1",
    title: "حفظ آيتين قبل الدرس القادم",
    type: "memorization",
    subject: "quran",
    dueLabel: "الدرس القادم",
    status: "not_started",
    description: "احفظ الآيتين 6 و7 من سورة الملك.",
  },
  {
    id: "task-ch1-4",
    childId: "ch1",
    title: "تسميع سورة الملك من آية 1 إلى 3",
    type: "recitation",
    subject: "quran",
    dueLabel: "هذا الأسبوع",
    status: "accepted",
    description: "أحسنت! تم قبول تسميعك.",
  },
  // Other children's tasks (never visible to ch1) — for realism only.
  {
    id: "task-ch2-1",
    childId: "ch2",
    title: "تسميع سورة الملك",
    type: "recitation",
    subject: "quran",
    dueLabel: "اليوم",
    status: "not_started",
  },
  {
    id: "task-ch9-1",
    childId: "ch9",
    title: "مراجعة المدود",
    type: "review",
    subject: "tajweed",
    dueLabel: "غدًا",
    status: "in_progress",
  },
];

/** The currently-open class activity (shown on /child only when active). */
export const activeActivity: ClassActivity = {
  id: "act-1",
  title: "اختبار سريع: أحكام النون الساكنة",
  description: "نشاط قصير يفتحه المعلم أثناء الحلقة.",
  active: true,
};
