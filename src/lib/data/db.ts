/*
  Aggregated mock dataset — EMPTY-FIRST.

  The app starts empty on a fresh device: user-facing seed arrays are
  intentionally empty so nothing demo appears automatically. The seed data still
  lives in the individual files (children.ts, lessons.ts, ...) and can be wired
  to an explicit "fill demo data" action later — it is just not auto-loaded.

  Kept: `users` (identity / role resolution), `halaqas` (so the teacher has a
  halaqa to build in), and `activeActivity` (getActiveActivity reads its
  `.active` flag; the seed is inactive so nothing shows).

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
  // Empty-first: no auto-seeded user-facing data (types preserved via `typeof`).
  children: [] as typeof childProfiles,
  parentChildLinks: [] as typeof parentChildLinks,
  lessons: [] as typeof lessons,
  attendanceRecords: [] as typeof attendanceRecords,
  recitations: [] as typeof recitations,
  parentApprovals: [] as typeof parentApprovals,
  teacherReviews: [] as typeof teacherReviews,
  badges: [] as typeof badges,
  progressSnapshots: [] as typeof progressSnapshots,
  wishes: [] as typeof wishes,
  notifications: [] as typeof notifications,
  childTasks: [] as typeof childTasks,
  activeActivity,
} as const;

export type Db = typeof db;
