import type { AppNotification } from "@/types";

export const notifications: AppNotification[] = [
  {
    id: "n1",
    userId: "u-p1",
    title: "فيديو جديد بانتظار موافقتك",
    body: "طفلك سجّل تسميعًا جديدًا.",
    type: "video_pending_parent",
    createdAt: "2026-06-14T07:00:00Z",
  },
  {
    id: "n2",
    userId: "u-t1",
    title: "فيديو جديد بانتظار المراجعة",
    body: "وصل تسميع معتمَد من ولي الأمر.",
    type: "video_pending_teacher",
    createdAt: "2026-06-13T18:06:00Z",
  },
  {
    id: "n3",
    userId: "u-c1",
    title: "حصلت على وسام جديد",
    body: "وسام المثابر",
    type: "badge_awarded",
    readAt: "2026-06-13T20:00:00Z",
    createdAt: "2026-06-13T19:01:00Z",
  },
  {
    id: "n4",
    userId: "u-p1",
    title: "تم تقييم تسميع طفلك",
    body: "اطّلع على ملخص المعلم.",
    type: "teacher_summary",
    createdAt: "2026-06-13T19:05:00Z",
  },
];
