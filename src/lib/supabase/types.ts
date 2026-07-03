/*
  Hand-written backend row types (Phase 1b scaffolding).

  Practical placeholders mirroring supabase/migrations/* (docs/SUPABASE_SCHEMA_DRAFT.md).
  Replace later with generated types: `supabase gen types typescript`.
  Only the rows the data-access layer needs are modelled here.
*/

export type Uuid = string;
export type Timestamptz = string;

export type UserRole = "teacher" | "parent" | "admin";
export type InvitationType = "family" | "student";
export type LinkStatus = "active" | "removed";
export type EnrollmentStatus = "active" | "left";
export type AssignmentStatus = "active" | "closed" | "archived";
export type SubmissionSource = "assignment" | "prep" | "lesson" | "adhoc";
export type SubmissionState =
  | "uploading"
  | "pending_parent"
  | "pending_teacher"
  | "accepted"
  | "rerecord";
export type RecordingKind = "audio" | "video";
export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "not_joined"
  | "excused";

/** profiles — `type` (not `interface`) because it is used as a Row in the
 *  `Database` generic, which requires `Record<string, unknown>` compatibility. */
export type Profile = {
  id: Uuid; // = auth.users.id
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** teacher_profiles — `type` for the same Database-generic reason as Profile. */
export type TeacherProfile = {
  id: Uuid;
  bio: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** parent_profiles — `type` (used as a Row in the `Database` generic). */
export type ParentProfile = {
  id: Uuid;
  phone: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** classes — `type` (used as a Row in the `Database` generic). */
export type ClassRow = {
  id: Uuid;
  name: string;
  created_by: Uuid | null;
  archived: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** class_teachers — `type` (used as a Row in the `Database` generic). */
export type ClassTeacher = {
  id: Uuid;
  class_id: Uuid;
  teacher_id: Uuid;
  role: "owner" | "assistant";
  created_at: Timestamptz;
};

export type JoinRequestRole = "teacher" | "parent";
export type JoinRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

/** join_requests — controlled onboarding (011). `type` for the Database generic. */
export type JoinRequest = {
  id: Uuid;
  auth_user_id: Uuid | null;
  email: string;
  display_name: string;
  requested_role: JoinRequestRole;
  status: JoinRequestStatus;
  note: string | null;
  reviewed_by: Uuid | null;
  reviewed_at: Timestamptz | null;
  rejection_reason: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** children — `type` (used as a Row in the `Database` generic). */
export type Child = {
  id: Uuid;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  level: string | null;
  created_by_role: "parent" | "student" | "teacher" | null;
  via_invitation: boolean;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** class_students — `type` (used as a Row in the `Database` generic). */
export type ClassStudent = {
  id: Uuid;
  class_id: Uuid;
  child_id: Uuid;
  status: EnrollmentStatus;
  enrolled_at: Timestamptz;
};

/** parent_child_links — `type` (used as a Row in the `Database` generic). */
export type ParentChildLink = {
  id: Uuid;
  parent_id: Uuid;
  child_id: Uuid;
  status: LinkStatus;
  linked_at: Timestamptz;
};

/** invitations — `type` (used as a Row in the `Database` generic). */
export type Invitation = {
  id: Uuid;
  type: InvitationType;
  code: string;
  label: string | null;
  class_id: Uuid;
  created_by_teacher_id: Uuid;
  max_children: number;
  max_parents: number;
  used_children_count: number;
  used_parents_count: number;
  expires_at: Timestamptz | null;
  revoked_at: Timestamptz | null;
  used_at: Timestamptz | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
};

/** invitation_uses — `type` (used as a Row in the `Database` generic). */
export type InvitationUse = {
  id: Uuid;
  invitation_id: Uuid;
  used_by_parent_id: Uuid | null;
  child_id: Uuid | null;
  created_at: Timestamptz;
};

/** Public-safe view of an invitation for the /join screen (no internal ids). */
export interface InvitationPublic {
  type: InvitationType;
  label: string | null;
  max_children: number;
  remaining_children: number;
  status: "active" | "expired" | "revoked";
}

export interface ChildAccessCode {
  id: Uuid;
  child_id: Uuid;
  code: string;
  expires_at: Timestamptz | null;
  revoked_at: Timestamptz | null;
  rotated_at: Timestamptz | null;
  last_used_at: Timestamptz | null;
}

export interface ParentLinkCode {
  id: Uuid;
  child_id: Uuid;
  code: string;
  consumed_by_parent_id: Uuid | null;
  consumed_at: Timestamptz | null;
  expires_at: Timestamptz | null;
  revoked_at: Timestamptz | null;
}

/** child_device_grants — stores ONLY the token hash (never the raw token).
 *  A `type` (not `interface`) so it satisfies Supabase's `Record<string, unknown>`
 *  table-row constraint when used in the `Database` generic. */
export type ChildDeviceGrant = {
  id: Uuid;
  child_id: Uuid;
  grant_token_hash: string;
  grant_label: string | null;
  created_from_code_id: Uuid | null;
  expires_at: Timestamptz | null;
  revoked_at: Timestamptz | null;
  last_used_at: Timestamptz | null;
  created_at: Timestamptz;
};

export interface Assignment {
  id: Uuid;
  class_id: Uuid;
  teacher_id: Uuid;
  title: string;
  description: string | null;
  type: string;
  submission_type: string;
  due_label: string | null;
  status: AssignmentStatus;
  material_id: Uuid | null;
  lesson_id: Uuid | null;
  points: number | null;
}

export interface Submission {
  id: Uuid;
  assignment_id: Uuid | null;
  source_type: SubmissionSource;
  source_id: Uuid | null;
  class_id: Uuid;
  child_id: Uuid;
  submitted_by_parent_id: Uuid | null;
  submitted_via_grant_id: Uuid | null;
  teacher_id: Uuid | null;
  title: string;
  recording_path: string | null;
  recording_type: RecordingKind | null;
  duration_seconds: number | null;
  state: SubmissionState;
  note: string | null;
  points: number | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface ParentApproval {
  id: Uuid;
  submission_id: Uuid;
  parent_id: Uuid;
  decision: "approved" | "rerecord";
  note: string | null;
  created_at: Timestamptz;
}

export interface TeacherReview {
  id: Uuid;
  submission_id: Uuid;
  teacher_id: Uuid;
  decision: "accepted" | "rerecord";
  note: string | null;
  awarded_points: number;
  created_at: Timestamptz;
}

export interface PointsLedgerEntry {
  id: Uuid;
  child_id: Uuid;
  class_id: Uuid;
  teacher_id: Uuid | null;
  value: number;
  reason: string | null;
  category: string | null;
  note: string | null;
  source_type: string | null; // 'submission' | 'manual'
  source_id: Uuid | null; // = submissions.id when source_type='submission'
  material_id: Uuid | null;
  created_at: Timestamptz;
}

export interface AttendanceRecord {
  id: Uuid;
  class_id: Uuid;
  child_id: Uuid;
  session_date: string; // date
  status: AttendanceStatus;
  joined_at: Timestamptz | null;
  manual: boolean;
}
