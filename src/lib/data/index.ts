// الأشبال — data layer public surface.
// Prefer the scoped accessors (and `can`) over the raw `db` arrays in pages.

export { db } from "./db";
export type { Db } from "./db";

export {
  can,
  getVisibleChildren,
  getChildById,
  getRecitationsForViewer,
  getPendingParentApprovals,
  getPendingTeacherReviews,
  getWishesForViewer,
  getProgressForChild,
  getTeacherHalaqas,
  getNotificationsForViewer,
  getLessonsForChild,
  getNextLessonForChild,
  getBadgesForChild,
  getGuestSummary,
} from "./access";
export type { GuestSummary } from "./access";

export { getMockUser, getUserById } from "./session";
