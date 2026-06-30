# Supabase Schema Draft (Section 4)

> Planning only — no migrations are created in this task. Postgres / Supabase.
> All tables use `id uuid primary key default gen_random_uuid()`,
> `created_at timestamptz not null default now()`, and (where mutable)
> `updated_at timestamptz not null default now()` maintained by a trigger.
> **RLS is enabled on every table** (policies in `SUPABASE_RLS_POLICY_DRAFT.md`).
> The schema is multi-class capable (a `class_id` everywhere) even though the MVP
> ships ONE class and NO multi-class / halaqa-code UI.

Legend: PK = primary key, FK = foreign key, UQ = unique, IX = index.

---

## auth + profiles

### `profiles`
Purpose: one row per Supabase Auth user (teacher or parent). Children are NOT auth users in MVP.
- `id uuid PK` → **FK `auth.users(id)`** (same id as the auth user)
- `role text not null check (role in ('teacher','parent','admin'))`
- `display_name text not null`
- `avatar_url text`
- `created_at`, `updated_at`
- IX: `(role)`

### `teacher_profiles`
Purpose: teacher-specific fields (kept separate so `profiles` stays generic).
- `id uuid PK` → FK `profiles(id)` (1:1)
- `bio text`
- `created_at`, `updated_at`

### `parent_profiles`
Purpose: parent-specific fields.
- `id uuid PK` → FK `profiles(id)` (1:1)
- `phone text`  *(optional, demo-safe)*
- `created_at`, `updated_at`

---

## classes (internal "halaqa" — never surfaced as a code/selector in MVP)

### `classes`
Purpose: a teaching group. MVP seeds exactly one; schema supports many.
- `id uuid PK`
- `name text not null`           *(internal label, e.g. "حلقة الفجر")*
- `created_by uuid` → FK `profiles(id)`
- `archived boolean not null default false`
- `created_at`, `updated_at`

### `class_teachers`
Purpose: which teacher(s) belong to a class (M:N for the future; MVP = 1).
- `id uuid PK`
- `class_id uuid not null` → FK `classes(id)` on delete cascade
- `teacher_id uuid not null` → FK `profiles(id)`
- `role text not null default 'owner' check (role in ('owner','assistant'))`
- UQ: `(class_id, teacher_id)`
- IX: `(teacher_id)`

---

## children + links

### `children`
Purpose: a child profile (the unit submissions/points attach to). Not an auth user.
- `id uuid PK`
- `display_name text not null`
- `avatar_url text`
- `age int`
- `level text`                   *(مبتدئ/متوسط/متقدم — free text)*
- `created_by_role text check (created_by_role in ('parent','student','teacher'))`
- `via_invitation boolean not null default false`
- `created_at`, `updated_at`
- IX: `(display_name)`

### `class_students`
Purpose: enrolment of a child in a class (replaces `CURRENT_HALAQA_ID`/halaqaEnrollment).
- `id uuid PK`
- `class_id uuid not null` → FK `classes(id)` on delete cascade
- `child_id uuid not null` → FK `children(id)` on delete cascade
- `status text not null default 'active' check (status in ('active','left'))`
- `enrolled_at timestamptz not null default now()`
- UQ: `(class_id, child_id)`
- IX: `(class_id, status)`, `(child_id)`

### `parent_child_links`
Purpose: which parent can see/act for which child (replaces demo parent-child links).
- `id uuid PK`
- `parent_id uuid not null` → FK `profiles(id)` on delete cascade
- `child_id uuid not null` → FK `children(id)` on delete cascade
- `status text not null default 'active' check (status in ('active','removed'))`
- `linked_at timestamptz not null default now()`
- UQ: `(parent_id, child_id)`
- IX: `(parent_id, status)`, `(child_id, status)`

---

## invitations + codes

### `invitations`
Purpose: teacher-generated family/student invitations (replaces `alashbal:demo-invitations`).
- `id uuid PK`
- `type text not null check (type in ('family','student'))`
- `code text not null`                 *(SERVER-generated with sufficient entropy — C3; FAM-/STD- prefix may stay, but lengthen the random part beyond the demo's 4 chars. Never trust a client-supplied code.)*
- `label text`
- `class_id uuid not null` → FK `classes(id)`
- `created_by_teacher_id uuid not null` → FK `profiles(id)`
- `max_children int not null default 1`
- `max_parents int not null default 1`
- `used_children_count int not null default 0`
- `used_parents_count int not null default 0`
- `expires_at timestamptz`
- `revoked_at timestamptz`
- `used_at timestamptz`                 *(set when fully used — student single-use)*
- `created_at`, `updated_at`
- UQ: `(code)`  *(case-insensitive: store normalized upper-case, or a UQ on `upper(code)`)*
- IX: `(created_by_teacher_id)`, `(class_id)`
- Derived status (not a column): `revoked_at` → revoked; `expires_at < now()` → expired; else active.

### `invitation_uses`
Purpose: audit each successful use (who registered what). Server-written only.
- `id uuid PK`
- `invitation_id uuid not null` → FK `invitations(id)` on delete cascade
- `used_by_parent_id uuid` → FK `profiles(id)`   *(family parent)*
- `child_id uuid` → FK `children(id)`            *(each created child)*
- `created_at`
- IX: `(invitation_id)`

### `child_access_codes`  (TLB- — "كود دخول الطفل")  *(C3: codes expire + rotate)*
Purpose: a short-lived code a child redeems to MINT a `child_device_grant` on a
device (it does NOT itself grant access). Parent can regenerate it.
- `id uuid PK`
- `child_id uuid not null` → FK `children(id)` on delete cascade
- `code text not null`              *(server-generated, sufficient entropy)*
- `expires_at timestamptz`          **(C3: codes expire)**
- `revoked_at timestamptz`          **(C3: regeneration revokes the old code)**
- `rotated_at timestamptz`          *(when the parent regenerated it)*
- `last_used_at timestamptz`        *(throttle / audit redemptions)*
- `created_at`
- UQ: `(code)` (case-insensitive / normalized upper); IX: `(child_id)`
- Status (not a column): `revoked_at` → revoked; `expires_at < now()` → expired; else active.

### `parent_link_codes`  (WLD- — "كود ربط ولي الأمر")  *(C3: codes expire + rotate)*
Purpose: a self-registered student's code so a parent can claim/link them.
Single-consume; regenerable.
- `id uuid PK`
- `child_id uuid not null` → FK `children(id)` on delete cascade
- `code text not null`              *(server-generated, sufficient entropy)*
- `consumed_by_parent_id uuid` → FK `profiles(id)`
- `consumed_at timestamptz`
- `expires_at timestamptz`          **(C3: codes expire)**
- `revoked_at timestamptz`          **(C3: regeneration revokes the old code)**
- `created_at`
- UQ: `(code)` (case-insensitive / normalized upper); IX: `(child_id)`

### `child_device_grants`  **(C1: server-side proof a device may act for a child)**
Purpose: a server-issued, revocable, expiring capability proving that a specific
device/browser session may act for ONE child. Created by redeeming a
`child_access_codes` code. **This — not a client-supplied `child_id` — is what
authorizes the child/device path.** Not full child Auth.
- `id uuid PK`
- `child_id uuid not null` → FK `children(id)` on delete cascade
- `grant_token_hash text not null`  *(store ONLY the hash; raw token lives on the device localStorage)*
- `grant_label text`                *(optional, e.g. "جهاز العائلة")*
- `created_from_code_id uuid` → FK `child_access_codes(id)`
- `expires_at timestamptz`          *(e.g. now() + 30 days; slidable on use)*
- `revoked_at timestamptz`          *(parent/teacher can revoke a device)*
- `last_used_at timestamptz`
- `created_at`
- UQ: `(grant_token_hash)`; IX: `(child_id)`
- Status (not a column): valid iff `revoked_at is null and expires_at > now()`.
- The raw token is presented per request (header / server-action arg); the server
  hashes it and matches `grant_token_hash` for that child (see `has_child_grant`
  in the RLS draft).

---

## learning content (teacher-authored)

### `learning_materials`  (replaces `alashbal:materials`)
- `id uuid PK`
- `class_id uuid not null` → FK `classes(id)`
- `name text not null`
- `type text not null`                  *(quran/tajweed/behavior/hadith/…)*
- `icon_key text`, `color_token text`
- `show_in_child_progress boolean not null default true`
- `target_points int not null default 0`
- `sort_order int not null default 0`
- `archived boolean not null default false`
- `created_at`, `updated_at`
- IX: `(class_id, archived)`

### `lessons`  (replaces `alashbal:material-lessons`)
Purpose: lessons under a material (surah/topic units).
- `id uuid PK`
- `material_id uuid not null` → FK `learning_materials(id)` on delete cascade
- `title text not null`, `description text`
- `surah_or_topic text`, `verse_start int`, `verse_end int`
- `default_points int not null default 0`
- `allowed_submission_types text[] not null default '{}'`  *(audio/video/parent_check/teacher_check)*
- `sort_order int not null default 0`
- `archived boolean not null default false`
- `created_at`, `updated_at`
- IX: `(material_id, archived)`

### `daily_prep`  (replaces `alashbal:lesson-prep`)
Purpose: the teacher's "today/upcoming" lesson prep for a class.
- `id uuid PK`
- `class_id uuid not null` → FK `classes(id)`
- `teacher_id uuid not null` → FK `profiles(id)`
- `title text not null`, `subject text`, `surah_or_topic text`
- `ayah_from text`, `ayah_to text`, `objective text`, `student_notes text`
- `lesson_date date not null`
- `lesson_status text not null default 'today' check (lesson_status in ('today','upcoming'))`
- `requirement_type text`, `submission_type text`, `due_label text`
- `created_at`, `updated_at`
- IX: `(class_id, lesson_date)`

### `assignments`  (replaces `alashbal:student-assignments`)
Purpose: student tasks for a class (independent of prep).
- `id uuid PK`
- `class_id uuid not null` → FK `classes(id)`
- `teacher_id uuid not null` → FK `profiles(id)`
- `title text not null`, `description text`
- `type text not null`                  *(recitation/memorization/review/reading/confirm)*
- `submission_type text not null`       *(none/audio/video/audio_or_video)*
- `due_label text`
- `status text not null default 'active' check (status in ('active','closed','archived'))`
- `material_id uuid` → FK `learning_materials(id)`
- `lesson_id uuid` → FK `lessons(id)`
- `points int`
- `created_at`, `updated_at`
- IX: `(class_id, status)`

---

## submissions workflow

### `submissions`  (replaces `alashbal:submissions`; blob → Storage)  **(C2: per-child uniqueness)**
Purpose: a child's recorded recitation moving child → parent → teacher.
**Keyed per child, NOT globally by task.** The demo's `Record<taskId, Submission>`
(one row per task globally) is a bug: two siblings on one device submitting the
same assignment overwrite each other. The backend uses one active row per child
per assignment.
- `id uuid PK`  *(parent_approvals / teacher_reviews / points_ledger all reference THIS id)*
- `assignment_id uuid` → FK `assignments(id)`   *(nullable — see source_type/source_id)*
- `source_type text not null default 'assignment' check (source_type in ('assignment','prep','lesson','adhoc'))`  **(C2/#8)**
- `source_id uuid`                       *(the prep/lesson id when not an assignment)*
- `class_id uuid not null` → FK `classes(id)`
- `child_id uuid not null` → FK `children(id)`
- `submitted_by_parent_id uuid` → FK `profiles(id)`  *(device's linked parent, if any; NOT the authz source — approval authz is dynamic via `parent_child_links`)*
- `submitted_via_grant_id uuid` → FK `child_device_grants(id)`  *(set when a device grant submitted it)*
- `teacher_id uuid` → FK `profiles(id)`         *(class teacher to review)*
- `title text not null`
- `recording_path text`                 *(Storage object path — SERVER-generated, see storage plan)*
- `recording_type text check (recording_type in ('audio','video'))`
- `duration_seconds int`
- `state text not null default 'uploading' check (state in ('uploading','pending_parent','pending_teacher','accepted','rerecord'))`  **(C4: 'uploading' added)**
- `note text`
- `material_id uuid`, `lesson_id uuid`, `points int`
- `created_at`, `updated_at`
- **UQ: `(child_id, assignment_id)`** — one active submission per child per assignment
  **(C2)**. (If re-records must keep history, add a `submission_revisions` table
  later and keep this row as the latest; do NOT key by `taskId` alone.)
- IX: `(child_id)`, `(teacher_id, state)`, `(class_id, state)`

### `parent_approvals`  (audit of the parent decision)
Purpose: record who approved/sent-back and when (the `submissions.state` is the live value).
- `id uuid PK`
- `submission_id uuid not null` → FK `submissions(id)` on delete cascade
- `parent_id uuid not null` → FK `profiles(id)`
- `decision text not null check (decision in ('approved','rerecord'))`
- `note text`
- `created_at`
- IX: `(submission_id)`

### `teacher_reviews`  (replaces `alashbal:reviews`)
Purpose: the teacher's review/grade of a submission.
- `id uuid PK`
- `submission_id uuid not null` → FK `submissions(id)` on delete cascade
- `teacher_id uuid not null` → FK `profiles(id)`
- `decision text not null check (decision in ('accepted','rerecord'))`
- `note text`
- `awarded_points int not null default 0`
- `created_at`
- UQ: `(submission_id)`  *(one active review per submission)*

---

## points / progress / attendance

### `points_ledger`  (replaces `alashbal:points`)
Purpose: append-only points entries per child (progress is derived from this).
- `id uuid PK`
- `child_id uuid not null` → FK `children(id)` on delete cascade
- `class_id uuid not null` → FK `classes(id)`
- `teacher_id uuid` → FK `profiles(id)`
- `value int not null`
- `reason text`, `category text`, `note text`
- `source_type text`, `source_id uuid`  *(when `source_type='submission'`, `source_id` = `submissions.id` — points are tied to the submission id, not a task id)*
- `material_id uuid` → FK `learning_materials(id)`
- `created_at`
- IX: `(child_id, created_at)`

### `child_progress`  (replaces derived `progress.ts`)
Purpose: optional materialized per-child/material progress. MVP can compute this from
`points_ledger` + `learning_materials` in a VIEW instead of a table.
- `child_id uuid` → FK `children(id)`
- `material_id uuid` → FK `learning_materials(id)`
- `earned_points int not null default 0`
- `updated_at`
- PK: `(child_id, material_id)`

### `attendance_records`  (replaces `alashbal:attendance-*`)
Purpose: per child per session attendance.
- `id uuid PK`
- `class_id uuid not null` → FK `classes(id)`
- `child_id uuid not null` → FK `children(id)`
- `session_date date not null`
- `status text not null check (status in ('present','late','absent','not_joined','excused'))`
- `joined_at timestamptz`, `manual boolean not null default false`
- `created_at`, `updated_at`
- UQ: `(class_id, child_id, session_date)`
- IX: `(class_id, session_date)`
- (The "attendance gate" — open/close a meeting window — can be a small
  `attendance_sessions` table keyed by `(class_id, session_date)` if needed.)

---

## audit

### `audit_events`
Purpose: append-only security/audit trail (invitation use, logins, approvals, deletes).
Server-written (service role) only.
- `id uuid PK`
- `actor_id uuid`                       *(profiles.id or null for anon/system)*
- `actor_role text`
- `action text not null`                *(e.g. 'invitation.revoke','submission.delete')*
- `subject_table text`, `subject_id uuid`
- `metadata jsonb`
- `created_at`
- IX: `(subject_table, subject_id)`, `(created_at)`

---

## Notes / deliberate decisions

- **No `halaqa_code` column anywhere.** The legacy `halaqaEnrollment.ts`
  (`alashbal:demo-halaqa-*`, with `halaqaCode`) is dropped; enrolment is
  `class_students`. Class selection is never exposed in the MVP UI.
- **Children are not auth users** → `children` has no FK to `auth.users`.
  Access is authorized via `parent_child_links` (parent),
  `class_students` + `class_teachers` (teacher), and **`child_device_grants`
  (the device/child path — C1)**.
- **`active_child_id` / `device_child_ids` are NOT tables** — they stay in
  device localStorage. They are a UI convenience ONLY and are **never** the
  authorization. The device proves access with a `child_device_grants` token
  (C1); the server validates the grant, not the client-supplied `child_id`.
- **C2 — submissions are unique per `(child_id, assignment_id)`** (not keyed by
  task globally). `parent_approvals`, `teacher_reviews`, and `points_ledger`
  (`source_type='submission'`) all reference `submissions.id`.
- **`notifications`, class `activities`/`activity_answers`** are optional for the
  backend MVP; they can stay client-side initially or get simple tables later
  (`notifications`, `activities`, `activity_answers`) following the same RLS shape.
