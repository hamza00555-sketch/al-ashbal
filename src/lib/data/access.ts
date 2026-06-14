/*
  Viewer-scoped data accessors.
  ------------------------------------------------------------------
  This is the ONLY surface pages should use to read data. Every accessor runs
  the result through the permission helpers, so a page can never accidentally
  render data the current role is not allowed to see.
*/
import type {
  AppNotification,
  Badge,
  ChildProfile,
  Halaqa,
  Lesson,
  ProgressSnapshot,
  RecitationSubmission,
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

export interface GuestSummary {
  totalChildren: number;
  activeChildren: number;
  totalParents: number;
  halaqaCount: number;
  lessonsCompleted: number;
  badgesAwarded: number;
  groupProgressPercent: number;
}

/**
 * Safe aggregate overview for the honored guest.
 * Contains NO names, videos, wishes, notes, or individual scores.
 */
export function getGuestSummary(viewer: User): GuestSummary | null {
  if (!can.canViewGuestSummary(viewer)) return null;

  const badgesAwarded = db.teacherReviews.reduce(
    (sum, r) => sum + (r.badgeIds?.length ?? 0),
    0,
  );
  const avgProgress =
    db.progressSnapshots.reduce(
      (sum, p) =>
        sum + (p.quranPercent + p.tajweedPercent + p.behaviorPercent) / 3,
      0,
    ) / Math.max(1, db.progressSnapshots.length);

  return {
    totalChildren: db.children.length,
    activeChildren: db.children.filter((c) => c.isActive).length,
    totalParents: db.users.filter((u) => u.role === "parent").length,
    halaqaCount: db.halaqas.length,
    lessonsCompleted: db.lessons.filter((l) => l.status === "completed").length,
    badgesAwarded,
    groupProgressPercent: Math.round(avgProgress),
  };
}
