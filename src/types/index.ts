/*
  الأشبال — Domain types.
  Mirrors docs/03_DATA_MODEL.md. These are mock-phase shapes designed so the
  data layer can later be swapped from mock arrays to Firestore without UI churn.
*/

export type UserRole = "child" | "parent" | "teacher" | "guest" | "admin";

export interface User {
  id: string;
  displayName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  userId?: string;
  displayName: string;
  age?: number;
  halaqaId: string;
  parentIds: string[];
  isActive: boolean;
}

export type RelationshipLabel = "father" | "mother" | "guardian" | "other";

export interface ParentChildLink {
  id: string;
  parentId: string;
  childId: string;
  relationshipLabel?: RelationshipLabel;
  canApproveVideos: boolean;
  canViewWishes: boolean;
}

export interface Halaqa {
  id: string;
  name: string;
  teacherIds: string[];
  childIds: string[];
  defaultMeetUrl?: string;
}

export type LessonStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "completed"
  | "cancelled";

export interface Lesson {
  id: string;
  halaqaId: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  meetUrl?: string;
  quranSegment?: string;
  tajweedTopic?: string;
  behaviorTopic?: string;
  notes?: string;
  status: LessonStatus;
}

export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "excused"
  | "manual_override";

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  childId: string;
  status: AttendanceStatus;
  joinedAt?: string;
  updatedBy?: string;
  note?: string;
}

export type RecitationStatus =
  | "recorded"
  | "pending_parent_approval"
  | "parent_rejected"
  | "pending_teacher_review"
  | "teacher_reviewed"
  | "deleted";

export interface RecitationSubmission {
  id: string;
  childId: string;
  lessonId?: string;
  title: string;
  videoUrl?: string;
  durationSeconds?: number;
  status: RecitationStatus;
  parentApprovalId?: string;
  teacherReviewId?: string;
  expiresAt?: string;
}

export type ParentApprovalDecision = "approved" | "request_rerecord";

export interface ParentApproval {
  id: string;
  recitationId: string;
  parentId: string;
  decision: ParentApprovalDecision;
  reason?: string;
  createdAt: string;
}

export interface TeacherReview {
  id: string;
  recitationId: string;
  teacherId: string;
  quranScore?: number;
  tajweedScore?: number;
  behaviorNote?: string;
  teacherNote?: string;
  badgeIds?: string[];
  createdAt: string;
}

export interface ProgressSnapshot {
  id: string;
  childId: string;
  quranPercent: number;
  tajweedPercent: number;
  behaviorPercent: number;
  totalPoints: number;
  currentProgressBar: {
    label: string;
    current: number;
    target: number;
  };
}

export type BadgeCategory =
  | "quran"
  | "tajweed"
  | "behavior"
  | "progress"
  | "special";

export interface Badge {
  id: string;
  title: string;
  category: BadgeCategory;
  description?: string;
  icon?: string;
}

export type WishVisibility = "parent_only";

export type WishStatus =
  | "idea"
  | "seen_by_parent"
  | "saved"
  | "converted_to_goal"
  | "archived";

export type WishParentAction =
  | "keep"
  | "convert_to_goal"
  | "reward_badge"
  | "not_now";

export interface Wish {
  id: string;
  childId: string;
  title: string;
  description?: string;
  visibility: WishVisibility;
  status: WishStatus;
  parentAction?: WishParentAction;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "lesson_reminder"
  | "video_pending_parent"
  | "video_pending_teacher"
  | "teacher_summary"
  | "badge_awarded"
  | "wish_seen"
  | "progress_completed";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  readAt?: string;
  createdAt: string;
}

export type ChildTaskType = "recitation" | "memorization" | "review";
export type ChildTaskSubject = "quran" | "tajweed" | "behavior";
export type ChildTaskStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "pending_parent_approval"
  | "pending_teacher_review"
  | "accepted"
  | "rerecord_needed";

export interface ChildTask {
  id: string;
  childId: string;
  title: string;
  type: ChildTaskType;
  subject: ChildTaskSubject;
  dueLabel: string;
  status: ChildTaskStatus;
  description?: string;
}

/** A temporary class activity/quiz the teacher can open during a session. */
export interface ClassActivity {
  id: string;
  title: string;
  description: string;
  active: boolean;
}
