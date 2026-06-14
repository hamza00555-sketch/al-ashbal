import type {
  ParentApproval,
  RecitationSubmission,
  TeacherReview,
} from "@/types";

// Covers every meaningful status so permission filtering is testable:
//   r1 teacher_reviewed (ch1)        → teacher t1 sees it, review done
//   r2 pending_teacher_review (ch2)  → teacher t1 can review; parent approved
//   r3 pending_parent_approval (ch3) → parent p2 can approve; teacher BLOCKED
//   r4 parent_rejected (ch4)         → re-record requested; teacher BLOCKED
//   r5 recorded (ch9)                → parent p5 can approve; teacher BLOCKED
//   r6 pending_parent_approval (ch1) → parent p1 can approve
export const recitations: RecitationSubmission[] = [
  {
    id: "r1",
    childId: "ch1",
    lessonId: "l1",
    title: "تسميع الملك 1-5",
    videoUrl: "mock://video/r1",
    durationSeconds: 95,
    status: "teacher_reviewed",
    parentApprovalId: "pa1",
    teacherReviewId: "tr1",
  },
  {
    id: "r2",
    childId: "ch2",
    lessonId: "l1",
    title: "تسميع الملك 1-3",
    videoUrl: "mock://video/r2",
    durationSeconds: 70,
    status: "pending_teacher_review",
    parentApprovalId: "pa2",
  },
  {
    id: "r3",
    childId: "ch3",
    lessonId: "l1",
    title: "تسميع الملك 1-4",
    videoUrl: "mock://video/r3",
    durationSeconds: 80,
    status: "pending_parent_approval",
  },
  {
    id: "r4",
    childId: "ch4",
    lessonId: "l1",
    title: "تسميع الملك 1-2",
    videoUrl: "mock://video/r4",
    durationSeconds: 60,
    status: "parent_rejected",
    parentApprovalId: "pa3",
  },
  {
    id: "r5",
    childId: "ch9",
    lessonId: "l3",
    title: "تسميع القلم 1-5",
    videoUrl: "mock://video/r5",
    durationSeconds: 88,
    status: "recorded",
  },
  {
    id: "r6",
    childId: "ch1",
    lessonId: "l2",
    title: "تسميع الملك 12-16",
    videoUrl: "mock://video/r6",
    durationSeconds: 102,
    status: "pending_parent_approval",
  },
];

export const parentApprovals: ParentApproval[] = [
  { id: "pa1", recitationId: "r1", parentId: "u-p1", decision: "approved", createdAt: "2026-06-13T18:00:00Z" },
  { id: "pa2", recitationId: "r2", parentId: "u-p1", decision: "approved", createdAt: "2026-06-13T18:05:00Z" },
  {
    id: "pa3",
    recitationId: "r4",
    parentId: "u-p2",
    decision: "request_rerecord",
    reason: "خلّينا نعيدها بشكل أوضح",
    createdAt: "2026-06-13T18:10:00Z",
  },
];

export const teacherReviews: TeacherReview[] = [
  {
    id: "tr1",
    recitationId: "r1",
    teacherId: "u-t1",
    quranScore: 9,
    tajweedScore: 8,
    behaviorNote: "هادئ ومتعاون",
    teacherNote: "أحسنت، خطوة جميلة",
    badgeIds: ["b-quran-1"],
    createdAt: "2026-06-13T19:00:00Z",
  },
];
