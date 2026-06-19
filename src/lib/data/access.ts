/*
  Viewer-scoped data accessors.
  ------------------------------------------------------------------
  This is the ONLY surface pages should use to read data. Every accessor runs
  the result through the permission helpers, so a page can never accidentally
  render data the current role is not allowed to see.
*/
import type {
  AppNotification,
  AttendanceRecord,
  Badge,
  ChildProfile,
  ChildTask,
  ClassActivity,
  Halaqa,
  Lesson,
  ProgressSnapshot,
  RecitationSubmission,
  TeacherReview,
  User,
  Wish,
} from "@/types";
import { createPermissions } from "@/lib/permissions";
import { db } from "./db";

/** Permission helpers bound to the mock dataset. */
export const can = createPermissions(db);

/** Children the viewer is allowed to see (never the full unfiltered list). */
export function getVisibleChildren(viewer: User): ChildProfile[] {
  return db.children.filter((c) => can.canViewChild(viewer, c.id));
}

/** A single child, or null if the viewer may not see them. */
export function getChildById(viewer: User, childId: string): ChildProfile | null {
  if (!can.canViewChild(viewer, childId)) return null;
  return db.children.find((c) => c.id === childId) ?? null;
}

/** Recitations visible to the viewer (optionally scoped to one child). */
export function getRecitationsForViewer(
  viewer: User,
  childId?: string,
): RecitationSubmission[] {
  return db.recitations.filter(
    (r) =>
      (childId === undefined || r.childId === childId) &&
      can.canViewRecitation(viewer, r),
  );
}

/** Videos a parent still needs to approve. Empty for non-parents. */
export function getPendingParentApprovals(viewer: User): RecitationSubmission[] {
  return db.recitations.filter((r) => can.canApproveRecitation(viewer, r));
}

/** Parent-approved videos awaiting the teacher's review. Empty for non-teachers. */
export function getPendingTeacherReviews(viewer: User): RecitationSubmission[] {
  return db.recitations.filter((r) => can.canReviewRecitation(viewer, r));
}

/** Wishes visible to the viewer (child + their parent only). */
export function getWishesForViewer(viewer: User, childId?: string): Wish[] {
  return db.wishes.filter(
    (w) =>
      (childId === undefined || w.childId === childId) &&
      can.canViewWish(viewer, w),
  );
}

/** A child's progress snapshot, gated by canViewChild. */
export function getProgressForChild(
  viewer: User,
  childId: string,
): ProgressSnapshot | null {
  if (!can.canViewChild(viewer, childId)) return null;
  return db.progressSnapshots.find((p) => p.childId === childId) ?? null;
}

/** The teacher who owns a halaqa (by halaqaId). Independent of the children
 *  roster — used so the child→teacher link works in empty-first mode. */
export function getTeacherIdForHalaqa(halaqaId: string): string | undefined {
  return db.halaqas.find((h) => h.id === halaqaId)?.teacherIds[0];
}

/** Halaqas a teacher (or admin) manages. */
export function getTeacherHalaqas(viewer: User): Halaqa[] {
  if (viewer.role === "admin") return [...db.halaqas];
  if (viewer.role !== "teacher") return [];
  return db.halaqas.filter((h) => h.teacherIds.includes(viewer.id));
}

/** Notifications addressed to the viewer only. */
export function getNotificationsForViewer(viewer: User): AppNotification[] {
  return db.notifications.filter((n) => n.userId === viewer.id);
}

/** Lessons of a child's halaqa, gated by canViewChild. */
export function getLessonsForChild(viewer: User, childId: string): Lesson[] {
  if (!can.canViewChild(viewer, childId)) return [];
  const child = db.children.find((c) => c.id === childId);
  if (!child) return [];
  return db.lessons.filter((l) => l.halaqaId === child.halaqaId);
}

/** The next upcoming/live lesson for a child, or null. */
export function getNextLessonForChild(viewer: User, childId: string): Lesson | null {
  const upcoming = getLessonsForChild(viewer, childId)
    .filter((l) => l.status === "scheduled" || l.status === "live")
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  return upcoming[0] ?? null;
}

/** Badges a child has been awarded (via teacher reviews), gated by canViewChild. */
export function getBadgesForChild(viewer: User, childId: string): Badge[] {
  if (!can.canViewChild(viewer, childId)) return [];
  const childRecitationIds = db.recitations
    .filter((r) => r.childId === childId)
    .map((r) => r.id);
  const awarded = new Set<string>();
  for (const review of db.teacherReviews) {
    if (!childRecitationIds.includes(review.recitationId)) continue;
    review.badgeIds?.forEach((id) => awarded.add(id));
  }
  return db.badges.filter((b) => awarded.has(b.id));
}

/** A child's tasks (recitation / memorization / review), gated by canViewChild. */
export function getTasksForChild(viewer: User, childId: string): ChildTask[] {
  if (!can.canViewChild(viewer, childId)) return [];
  return db.childTasks.filter((t) => t.childId === childId);
}

/** The currently-open class activity, or null when none is active. */
export function getActiveActivity(): ClassActivity | null {
  return db.activeActivity.active ? db.activeActivity : null;
}

/** A child's attendance records, gated by canViewChild. */
export function getAttendanceForChild(
  viewer: User,
  childId: string,
): AttendanceRecord[] {
  if (!can.canViewChild(viewer, childId)) return [];
  return db.attendanceRecords.filter((a) => a.childId === childId);
}

/** Teacher reviews for a child's recitations, gated by canViewChild. */
export function getTeacherReviewsForChild(
  viewer: User,
  childId: string,
): TeacherReview[] {
  if (!can.canViewChild(viewer, childId)) return [];
  const recitationIds = db.recitations
    .filter((r) => r.childId === childId)
    .map((r) => r.id);
  return db.teacherReviews.filter((rv) => recitationIds.includes(rv.recitationId));
}

/** Teacher user ids of a child's halaqa (gated by canViewChild). */
export function getTeacherIdsForChild(viewer: User, childId: string): string[] {
  if (!can.canViewChild(viewer, childId)) return [];
  const child = db.children.find((c) => c.id === childId);
  if (!child) return [];
  const halaqa = db.halaqas.find((h) => h.id === child.halaqaId);
  return halaqa ? [...halaqa.teacherIds] : [];
}

/** Lessons of the teacher's (or admin's) halaqas. */
export function getLessonsForTeacher(viewer: User): Lesson[] {
  if (!can.canViewTeacherDashboard(viewer)) return [];
  const halaqaIds =
    viewer.role === "admin"
      ? db.halaqas.map((h) => h.id)
      : db.halaqas.filter((h) => h.teacherIds.includes(viewer.id)).map((h) => h.id);
  return db.lessons.filter((l) => halaqaIds.includes(l.halaqaId));
}

/** Attendance for a lesson, only if the viewer owns the lesson's halaqa (or admin). */
export function getAttendanceForLesson(
  viewer: User,
  lessonId: string,
): AttendanceRecord[] {
  const lesson = db.lessons.find((l) => l.id === lessonId);
  if (!lesson) return [];
  const owns =
    viewer.role === "admin" ||
    db.halaqas.some(
      (h) => h.id === lesson.halaqaId && h.teacherIds.includes(viewer.id),
    );
  if (!owns) return [];
  return db.attendanceRecords.filter((a) => a.lessonId === lessonId);
}

export type ChildStatusLevel = "excellent" | "follow_up" | "intervene";

export interface ChildStatusSummary {
  level: ChildStatusLevel;
  progressPercent: number;
  openTasks: number;
  lastActivity: string;
}

/**
 * Derive a child's overall status (gated by canViewChild). Rules:
 *  - intervene  : a re-record task, an absence, or progress < 40%
 *  - follow_up  : an open task, or progress < 70%
 *  - excellent  : otherwise
 */
export function getChildStatusSummary(viewer: User, childId: string): ChildStatusSummary | null {
  if (!can.canViewChild(viewer, childId)) return null;

  const progress = db.progressSnapshots.find((p) => p.childId === childId);
  const progressPercent = progress
    ? Math.round((progress.quranPercent + progress.tajweedPercent + progress.behaviorPercent) / 3)
    : 0;

  const tasks = db.childTasks.filter((t) => t.childId === childId);
  const openTasks = tasks.filter((t) => t.status !== "accepted").length;
  const hasRerecord = tasks.some((t) => t.status === "rerecord_needed");
  const hasAbsence = db.attendanceRecords.some(
    (a) => a.childId === childId && a.status === "absent",
  );

  let level: ChildStatusLevel;
  if (hasRerecord || hasAbsence || progressPercent < 40) level = "intervene";
  else if (openTasks > 0 || progressPercent < 70) level = "follow_up";
  else level = "excellent";

  const recitations = db.recitations.filter((r) => r.childId === childId);
  const lastActivity =
    recitations.length > 0
      ? `آخر تسميع: ${recitations[recitations.length - 1].title}`
      : tasks.length > 0
        ? `مهمة: ${tasks[0].title}`
        : "لا نشاط حديث";

  return { level, progressPercent, openTasks, lastActivity };
}

export interface ChildOverviewItem {
  child: ChildProfile;
  summary: ChildStatusSummary;
}

/** The parent's linked children, each with a status summary. */
export function getParentChildOverview(viewer: User): ChildOverviewItem[] {
  return getVisibleChildren(viewer)
    .map((child) => {
      const summary = getChildStatusSummary(viewer, child.id);
      return summary ? { child, summary } : null;
    })
    .filter((x): x is ChildOverviewItem => x !== null);
}

export interface GuestSummary {
  totalChildren: number;
  activeChildren: number;
  totalParents: number;
  halaqaCount: number;
  lessonsCompleted: number;
  lessonsToday: number;
  badgesAwarded: number;
  recitationsReviewed: number;
  groupProgressPercent: number;
  avgQuran: number;
  avgTajweed: number;
  avgBehavior: number;
  attendancePercent: number;
  present: number;
  late: number;
  absent: number;
}

/**
 * Safe aggregate overview for the honored guest.
 * Contains NO names, videos, wishes, notes, or individual scores — only
 * anonymous, group-level counts and averages.
 */
export function getGuestSummary(viewer: User): GuestSummary | null {
  if (!can.canViewGuestSummary(viewer)) return null;

  const snaps = db.progressSnapshots;
  const n = Math.max(1, snaps.length);
  const avg = (select: (p: ProgressSnapshot) => number) =>
    Math.round(snaps.reduce((sum, p) => sum + select(p), 0) / n);
  const avgQuran = avg((p) => p.quranPercent);
  const avgTajweed = avg((p) => p.tajweedPercent);
  const avgBehavior = avg((p) => p.behaviorPercent);

  const records = db.attendanceRecords;
  const present = records.filter((a) => a.status === "present").length;
  const late = records.filter((a) => a.status === "late").length;
  const absent = records.filter((a) => a.status === "absent").length;
  const attendancePercent =
    records.length === 0 ? 0 : Math.round((present / records.length) * 100);

  return {
    totalChildren: db.children.length,
    activeChildren: db.children.filter((c) => c.isActive).length,
    totalParents: db.users.filter((u) => u.role === "parent").length,
    halaqaCount: db.halaqas.length,
    lessonsCompleted: db.lessons.filter((l) => l.status === "completed").length,
    lessonsToday: db.lessons.filter((l) => l.status === "live" || l.status === "scheduled").length,
    badgesAwarded: db.teacherReviews.reduce((sum, r) => sum + (r.badgeIds?.length ?? 0), 0),
    recitationsReviewed: db.recitations.filter((r) => r.status === "teacher_reviewed").length,
    groupProgressPercent: Math.round((avgQuran + avgTajweed + avgBehavior) / 3),
    avgQuran,
    avgTajweed,
    avgBehavior,
    attendancePercent,
    present,
    late,
    absent,
  };
}
