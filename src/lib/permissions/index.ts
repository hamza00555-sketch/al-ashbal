/*
  الأشبال — Permission helpers (pure, data-source-agnostic).
  ------------------------------------------------------------------
  These functions never import mock data. They take the viewer, the target,
  and a PermissionContext describing relationships (links / halaqas / children),
  so the exact same logic works with Firestore later.

  Privacy rules enforced here (from docs/04_SECURITY_MODEL.md):
  - child sees only their own data
  - parent sees only linked children
  - teacher sees only children in their halaqa
  - teacher sees a recitation only AFTER parent approval
  - wishes are visible ONLY to the child and their parent
  - guest sees no individual child data (names / videos / wishes)
*/
import type {
  ChildProfile,
  Halaqa,
  ParentChildLink,
  RecitationStatus,
  RecitationSubmission,
  User,
  Wish,
} from "@/types";

export interface PermissionContext {
  children: ChildProfile[];
  parentChildLinks: ParentChildLink[];
  halaqas: Halaqa[];
}

/** Recitation states a teacher is allowed to see (parent-approved or later). */
const TEACHER_VISIBLE_STATUSES: RecitationStatus[] = [
  "pending_teacher_review",
  "teacher_reviewed",
];

/** Recitation states a parent can act on (still pending their approval). */
const PARENT_ACTIONABLE_STATUSES: RecitationStatus[] = [
  "recorded",
  "pending_parent_approval",
];

function childProfileOfUser(
  viewer: User,
  ctx: PermissionContext,
): ChildProfile | null {
  return ctx.children.find((c) => c.userId === viewer.id) ?? null;
}

function isOwnChild(viewer: User, childId: string, ctx: PermissionContext): boolean {
  const profile = childProfileOfUser(viewer, ctx);
  return profile !== null && profile.id === childId;
}

function parentLink(
  viewer: User,
  childId: string,
  ctx: PermissionContext,
): ParentChildLink | null {
  return (
    ctx.parentChildLinks.find(
      (l) => l.parentId === viewer.id && l.childId === childId,
    ) ?? null
  );
}

function teacherOwnsChild(
  viewer: User,
  childId: string,
  ctx: PermissionContext,
): boolean {
  const child = ctx.children.find((c) => c.id === childId);
  if (!child) return false;
  return ctx.halaqas.some(
    (h) => h.id === child.halaqaId && h.teacherIds.includes(viewer.id),
  );
}

export function canViewChild(
  viewer: User,
  childId: string,
  ctx: PermissionContext,
): boolean {
  switch (viewer.role) {
    case "admin":
      return true;
    case "child":
      return isOwnChild(viewer, childId, ctx);
    case "parent":
      return parentLink(viewer, childId, ctx) !== null;
    case "teacher":
      return teacherOwnsChild(viewer, childId, ctx);
    default:
      return false; // guest
  }
}

export function canViewRecitation(
  viewer: User,
  recitation: RecitationSubmission,
  ctx: PermissionContext,
): boolean {
  if (recitation.status === "deleted") return viewer.role === "admin";
  switch (viewer.role) {
    case "admin":
      return true;
    case "child":
      return isOwnChild(viewer, recitation.childId, ctx);
    case "parent":
      // Parent sees their child's videos at every stage (they are the gate).
      return parentLink(viewer, recitation.childId, ctx) !== null;
    case "teacher":
      // Only after parent approval, and only for their own halaqa.
      return (
        TEACHER_VISIBLE_STATUSES.includes(recitation.status) &&
        teacherOwnsChild(viewer, recitation.childId, ctx)
      );
    default:
      return false; // guest
  }
}

export function canApproveRecitation(
  viewer: User,
  recitation: RecitationSubmission,
  ctx: PermissionContext,
): boolean {
  if (viewer.role !== "parent") return false;
  const link = parentLink(viewer, recitation.childId, ctx);
  return (
    link !== null &&
    link.canApproveVideos &&
    PARENT_ACTIONABLE_STATUSES.includes(recitation.status)
  );
}

export function canReviewRecitation(
  viewer: User,
  recitation: RecitationSubmission,
  ctx: PermissionContext,
): boolean {
  if (viewer.role !== "teacher") return false;
  return (
    recitation.status === "pending_teacher_review" &&
    teacherOwnsChild(viewer, recitation.childId, ctx)
  );
}

export function canViewWish(
  viewer: User,
  wish: Wish,
  ctx: PermissionContext,
): boolean {
  // Wishes are strictly child + parent only (not teacher, guest, or admin).
  if (wish.visibility !== "parent_only") return false;
  if (viewer.role === "child") return isOwnChild(viewer, wish.childId, ctx);
  if (viewer.role === "parent") {
    const link = parentLink(viewer, wish.childId, ctx);
    return link !== null && link.canViewWishes;
  }
  return false;
}

export function canViewTeacherDashboard(viewer: User): boolean {
  return viewer.role === "teacher" || viewer.role === "admin";
}

export function canViewGuestSummary(viewer: User): boolean {
  return (
    viewer.role === "guest" ||
    viewer.role === "teacher" ||
    viewer.role === "admin"
  );
}

export interface Permissions {
  canViewChild: (viewer: User, childId: string) => boolean;
  canViewRecitation: (viewer: User, recitation: RecitationSubmission) => boolean;
  canApproveRecitation: (viewer: User, recitation: RecitationSubmission) => boolean;
  canReviewRecitation: (viewer: User, recitation: RecitationSubmission) => boolean;
  canViewWish: (viewer: User, wish: Wish) => boolean;
  canViewTeacherDashboard: (viewer: User) => boolean;
  canViewGuestSummary: (viewer: User) => boolean;
}

/** Bind the helpers to a fixed relationship context (mock now, Firestore later). */
export function createPermissions(ctx: PermissionContext): Permissions {
  return {
    canViewChild: (viewer, childId) => canViewChild(viewer, childId, ctx),
    canViewRecitation: (viewer, recitation) =>
      canViewRecitation(viewer, recitation, ctx),
    canApproveRecitation: (viewer, recitation) =>
      canApproveRecitation(viewer, recitation, ctx),
    canReviewRecitation: (viewer, recitation) =>
      canReviewRecitation(viewer, recitation, ctx),
    canViewWish: (viewer, wish) => canViewWish(viewer, wish, ctx),
    canViewTeacherDashboard,
    canViewGuestSummary,
  };
}
