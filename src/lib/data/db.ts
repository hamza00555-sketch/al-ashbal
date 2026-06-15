/*
  Aggregated mock dataset.
  This object also satisfies PermissionContext (children / parentChildLinks /
  halaqas), so it can be passed straight to createPermissions().

  IMPORTANT: pages must NOT read these raw arrays. Use the scoped accessors in
  ./access.ts which apply role-based filtering on every read.
*/
import { users } from "./users";
import { halaqas } from "./halaqas";
import { childProfiles, parentChildLinks } from "./children";
import { lessons, attendanceRecords } from "./lessons";
import { recitations, parentApprovals, teacherReviews } from "./recitations";
import { badges, progressSnapshots } from "./progress";
import { wishes } from "./wishes";
import { notifications } from "./notifications";
import { childTasks, activeActivity } from "./tasks";

export const db = {
  users,
  halaqas,
  children: childProfiles,
  parentChildLinks,
  lessons,
  attendanceRecords,
  recitations,
  parentApprovals,
  teacherReviews,
  badges,
  progressSnapshots,
  wishes,
  notifications,
  childTasks,
  activeActivity,
} as const;

export type Db = typeof db;
